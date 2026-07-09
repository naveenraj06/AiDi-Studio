import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { env } from "../lib/env.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import { serializeUser } from "../lib/serialize.js";
import { createSession } from "../lib/sessions.js";
import { generateRawToken, hashToken } from "../lib/tokens.js";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const emailSchema = z.object({ email: z.string().trim().email("Enter a valid email address") });

const verifySchema = z.object({ token: z.string().min(1) });

const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function devToken(raw: string) {
  return env.NODE_ENV === "production" ? undefined : raw;
}

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/signup", async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: "An account with that email already exists" });

    const user = await prisma.user.create({
      data: { email, displayName: name, passwordHash: await hashPassword(password) },
    });

    const raw = generateRawToken();
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
    });
    app.log.info(`[dev-email] verification link for ${email}: /verify-email?token=${raw}`);

    return reply.code(201).send({ user: serializeUser(user), verification_token: devToken(raw) });
  });

  app.post("/auth/resend-verification", async (request, reply) => {
    const parsed = emailSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    let raw: string | undefined;
    if (user && !user.emailVerified) {
      raw = generateRawToken();
      await prisma.emailVerificationToken.create({
        data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
      });
      app.log.info(`[dev-email] verification link for ${user.email}: /verify-email?token=${raw}`);
    }

    return reply.send({ ok: true, verification_token: raw ? devToken(raw) : undefined });
  });

  app.post("/auth/verify-email", async (request, reply) => {
    const parsed = verifySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid token" });

    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashToken(parsed.data.token) },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return reply.code(400).send({ error: "Invalid or expired verification link" });
    }

    const user = await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });
    await prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

    const { accessToken } = await createSession(app, user.id, {
      userAgent: request.headers["user-agent"],
      ip: request.ip,
    });

    return reply.send({ user: serializeUser(user), access_token: accessToken });
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ error: "Invalid email or password" });
    }
    if (!user.emailVerified) {
      return reply.code(403).send({ error: "Verify your email before signing in", code: "EMAIL_NOT_VERIFIED" });
    }

    const { accessToken } = await createSession(app, user.id, {
      userAgent: request.headers["user-agent"],
      ip: request.ip,
    });

    return reply.send({ user: serializeUser(user), access_token: accessToken });
  });

  app.post("/auth/forgot-password", async (request, reply) => {
    const parsed = emailSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    let raw: string | undefined;
    if (user) {
      raw = generateRawToken();
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
      });
      app.log.info(`[dev-email] password reset link for ${user.email}: /reset-password?token=${raw}`);
    }

    return reply.send({ ok: true, reset_token: raw ? devToken(raw) : undefined });
  });

  app.post("/auth/reset-password", async (request, reply) => {
    const parsed = resetSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(parsed.data.token) },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return reply.code(400).send({ error: "Invalid or expired reset link" });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(parsed.data.password) },
      }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return reply.send({ ok: true });
  });

  app.post("/auth/logout", { preHandler: app.authenticate }, async (request, reply) => {
    await prisma.session.update({ where: { id: request.sessionId }, data: { revokedAt: new Date() } });
    return reply.code(204).send();
  });

  app.post("/auth/logout-all", { preHandler: app.authenticate }, async (request, reply) => {
    await prisma.session.updateMany({
      where: { userId: request.userId, id: { not: request.sessionId }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return reply.send({ ok: true });
  });

  app.get("/auth/me", { preHandler: app.authenticate }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.userId } });
    if (!user) return reply.code(404).send({ error: "Not found" });
    return reply.send({ user: serializeUser(user) });
  });
}
