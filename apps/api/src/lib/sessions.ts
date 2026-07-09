import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "./prisma.js";
import { generateRawToken, hashToken } from "./tokens.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(
  app: FastifyInstance,
  userId: string,
  meta: { userAgent?: string; ip?: string },
) {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      id,
      userId,
      tokenHash: hashToken(generateRawToken()),
      userAgent: meta.userAgent,
      ip: meta.ip,
      expiresAt,
    },
  });

  const accessToken = app.jwt.sign({ sub: userId, sid: id });
  return { accessToken, sessionId: id, expiresAt };
}
