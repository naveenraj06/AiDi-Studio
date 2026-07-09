import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getProjectRole, roleAtLeast } from "../lib/authz.js";
import { serializeResource, type ResourceRow } from "../lib/serialize.js";
import { assertPublicHttpUrl } from "../lib/ssrfGuard.js";
import { supabase } from "../lib/supabase.js";

const RESOURCE_SELECT = "*, widgets:widgets(count)";

const createSchema = z.object({
  name: z.string().trim().min(1, "Enter a resource name"),
  url: z.string().trim().url("Enter a valid URL"),
  authType: z.enum(["bearer", "api_key", "oauth", "none"]).default("none"),
  authCredential: z.string().trim().optional(),
  importedFrom: z.enum(["postman", "openapi", "curl", "manual"]).default("manual"),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  url: z.string().trim().url().optional(),
  authType: z.enum(["bearer", "api_key", "oauth", "none"]).optional(),
  authCredential: z.string().trim().optional(),
});

function toRow(input: Partial<z.infer<typeof createSchema>>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.url !== undefined) row.url = input.url;
  if (input.authType !== undefined) row.auth_type = input.authType;
  if (input.authCredential !== undefined) row.auth_credential = input.authCredential;
  if (input.importedFrom !== undefined) row.imported_from = input.importedFrom;
  return row;
}

export default async function resourceRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/projects/:projectId/resources", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const { data, error } = await supabase
      .from("api_resources")
      .select(RESOURCE_SELECT)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .returns<ResourceRow[]>();
    if (error) return reply.code(500).send({ error: "Failed to load resources" });
    return reply.send({ resources: (data ?? []).map(serializeResource) });
  });

  app.post("/projects/:projectId/resources", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const { data: resource, error } = await supabase
      .from("api_resources")
      .insert({ ...toRow(parsed.data), project_id: projectId })
      .select(RESOURCE_SELECT)
      .single<ResourceRow>();
    if (error || !resource) return reply.code(500).send({ error: "Failed to create resource" });
    return reply.code(201).send({ resource: serializeResource(resource) });
  });

  app.patch("/projects/:projectId/resources/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

    const { data: resource, error } = await supabase
      .from("api_resources")
      .update({ ...toRow(parsed.data), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("project_id", projectId)
      .select(RESOURCE_SELECT)
      .maybeSingle<ResourceRow>();
    if (error) return reply.code(500).send({ error: "Failed to update resource" });
    if (!resource) return reply.code(404).send({ error: "Resource not found" });
    return reply.send({ resource: serializeResource(resource) });
  });

  app.delete("/projects/:projectId/resources/:id", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "editor")) return reply.code(404).send({ error: "Project not found" });

    const { data, error } = await supabase
      .from("api_resources")
      .delete()
      .eq("id", id)
      .eq("project_id", projectId)
      .select("id");
    if (error) return reply.code(500).send({ error: "Failed to delete resource" });
    if (!data || data.length === 0) return reply.code(404).send({ error: "Resource not found" });
    return reply.code(204).send();
  });

  app.post("/projects/:projectId/resources/:id/test-connection", async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const role = await getProjectRole(request.userId, projectId);
    if (!roleAtLeast(role, "viewer")) return reply.code(404).send({ error: "Project not found" });

    const { data: resource, error: fetchError } = await supabase
      .from("api_resources")
      .select("url, auth_type, auth_credential")
      .eq("id", id)
      .eq("project_id", projectId)
      .maybeSingle();
    if (fetchError || !resource) return reply.code(404).send({ error: "Resource not found" });

    const startedAt = Date.now();
    let status: "healthy" | "error" = "error";
    try {
      const url = assertPublicHttpUrl(resource.url);
      const headers: Record<string, string> = {};
      if (resource.auth_type === "bearer" && resource.auth_credential) {
        headers.Authorization = `Bearer ${resource.auth_credential}`;
      } else if (resource.auth_type === "api_key" && resource.auth_credential) {
        headers["X-API-Key"] = resource.auth_credential;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { method: "GET", headers, signal: controller.signal });
      clearTimeout(timeout);
      status = res.ok ? "healthy" : "error";
    } catch {
      status = "error";
    }
    const latencyMs = Date.now() - startedAt;

    const { data: updated, error } = await supabase
      .from("api_resources")
      .update({ status, last_tested_at: new Date().toISOString(), last_test_latency_ms: latencyMs })
      .eq("id", id)
      .select(RESOURCE_SELECT)
      .single<ResourceRow>();
    if (error || !updated) return reply.code(500).send({ error: "Failed to update resource" });
    return reply.send({ resource: serializeResource(updated) });
  });
}
