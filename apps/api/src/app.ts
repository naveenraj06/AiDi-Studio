import compress from "@fastify/compress";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance } from "fastify";
import { env } from "./lib/env.js";
import supabaseAuthPlugin from "./plugins/supabaseAuth.js";
import billingRoutes from "./routes/billing.js";
import dashboardRoutes, { publicDashboardRoutes } from "./routes/dashboards.js";
import projectRoutes from "./routes/projects.js";
import resourceRoutes from "./routes/resources.js";
import teamRoutes from "./routes/team.js";
import widgetRoutes from "./routes/widgets.js";

/** Builds and registers the whole API — every route, plugin, and error handler —
 * without binding a port. Shared by the local dev entrypoint (server.ts), which
 * calls .listen() on the result, and the Vercel serverless entrypoint (api/index.ts),
 * which instead hands the built instance each request directly. */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true, trustProxy: true });

  await app.register(helmet);
  await app.register(compress);
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(supabaseAuthPlugin);

  app.get("/health", async () => ({ ok: true }));

  app.get("/auth/me", { preHandler: app.authenticate }, async (request, reply) => {
    return reply.send({ user: { id: request.userId, email: request.userEmail, name: request.userName } });
  });

  await app.register(projectRoutes);
  await app.register(resourceRoutes);
  await app.register(widgetRoutes);
  await app.register(dashboardRoutes);
  await app.register(publicDashboardRoutes);
  await app.register(teamRoutes);
  await app.register(billingRoutes);

  app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.code(statusCode).send({ error: statusCode === 500 ? "Internal server error" : error.message });
  });

  return app;
}
