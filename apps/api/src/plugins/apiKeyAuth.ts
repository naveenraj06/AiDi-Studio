import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parseApiKeyPrefix } from "../lib/apiKeys.js";
import { verifyPassword } from "../lib/password.js";
import { supabase } from "../lib/supabase.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticateApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    projectId: string;
    apiKeyId: string;
  }
}

interface ApiKeyRow {
  id: string;
  project_id: string;
  key_hash: string;
  revoked_at: string | null;
}

export default fp(async function apiKeyAuthPlugin(app: FastifyInstance) {
  app.decorate("authenticateApiKey", async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization;
    const key = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    const prefix = key ? parseApiKeyPrefix(key) : null;
    if (!key || !prefix) return reply.code(401).send({ error: "Missing or invalid API key" });

    const { data: candidates } = await supabase
      .from("api_keys")
      .select("id, project_id, key_hash, revoked_at")
      .eq("key_prefix", prefix)
      .returns<ApiKeyRow[]>();

    let matched: ApiKeyRow | undefined;
    for (const candidate of candidates ?? []) {
      if (await verifyPassword(key, candidate.key_hash)) {
        matched = candidate;
        break;
      }
    }
    if (!matched || matched.revoked_at) return reply.code(401).send({ error: "Invalid or revoked API key" });

    request.projectId = matched.project_id;
    request.apiKeyId = matched.id;

    supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", matched.id)
      .then(() => {});
  });
});
