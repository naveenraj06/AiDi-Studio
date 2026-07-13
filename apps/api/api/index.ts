import type { IncomingMessage, ServerResponse } from "node:http";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";

// Reused across warm invocations of the same serverless instance — buildApp()
// only runs again after a cold start, same as any other module-level cache.
let appPromise: Promise<FastifyInstance> | undefined;

function getApp(): Promise<FastifyInstance> {
  if (!appPromise) appPromise = buildApp();
  return appPromise;
}

/** Vercel's Node runtime calls this per request with plain Node req/res — Fastify
 * has no server of its own to listen on here, so this hands them straight to its
 * internal router instead (the standard way to run Fastify on a serverless host). */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  await app.ready();
  app.server.emit("request", req, res);
}
