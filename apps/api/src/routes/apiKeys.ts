import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateApiKey } from "../lib/apiKeys.js";
import { requireRole } from "../lib/authz.js";
import { supabase } from "../lib/supabase.js";
import { parseBody } from "../lib/validate.js";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

function serializeApiKey(k: ApiKeyRow) {
  return {
    id: k.id,
    name: k.name,
    key_prefix: k.key_prefix,
    created_at: k.created_at,
    last_used_at: k.last_used_at,
    revoked_at: k.revoked_at,
  };
}

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter a name for this key"),
});

export default async function apiKeyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get(
    "/projects/:projectId/api-keys",
    { preHandler: [requireRole("viewer", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .returns<ApiKeyRow[]>();
      if (error) return reply.code(500).send({ error: "Failed to load API keys" });
      return reply.send({ apiKeys: (data ?? []).map(serializeApiKey) });
    },
  );

  app.post(
    "/projects/:projectId/api-keys",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId } = request.params as { projectId: string };

      const data = parseBody(createSchema, request, reply);
      if (!data) return;

      const { data: project } = await supabase.from("projects").select("plan").eq("id", projectId).maybeSingle();
      if (project?.plan === "free") {
        return reply.code(403).send({ error: "Upgrade to Pro or Org to create API keys" });
      }

      const { key, prefix, keyHash } = await generateApiKey();
      const { data: created, error } = await supabase
        .from("api_keys")
        .insert({ project_id: projectId, name: data.name, key_prefix: prefix, key_hash: keyHash })
        .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
        .single<ApiKeyRow>();
      if (error || !created) return reply.code(500).send({ error: "Failed to create API key" });

      // The only time the raw secret is ever returned — callers must copy it now.
      return reply.code(201).send({ apiKey: { ...serializeApiKey(created), key } });
    },
  );

  app.delete(
    "/projects/:projectId/api-keys/:id",
    { preHandler: [requireRole("editor", "projectId")] },
    async (request, reply) => {
      const { projectId, id } = request.params as { projectId: string; id: string };
      const { data, error } = await supabase
        .from("api_keys")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", id)
        .eq("project_id", projectId)
        .select("id");
      if (error) return reply.code(500).send({ error: "Failed to revoke API key" });
      if (!data || data.length === 0) return reply.code(404).send({ error: "API key not found" });
      return reply.code(204).send();
    },
  );
}
