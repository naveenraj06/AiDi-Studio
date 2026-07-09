import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../lib/env.js";
import { supabase } from "../lib/supabase.js";

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
    userEmail: string;
    userName: string;
  }
}

async function fetchSupabaseUser(token: string): Promise<SupabaseUser | null> {
  let res: Response;
  try {
    res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_PUBLISHABLE_KEY },
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = (await res.json()) as {
    id: string;
    email?: string;
    user_metadata?: { name?: string; full_name?: string };
  };
  const email = data.email ?? "";
  return {
    id: data.id,
    email,
    name: data.user_metadata?.name ?? data.user_metadata?.full_name ?? email.split("@")[0] ?? "User",
  };
}

export default fp(async function supabaseAuthPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    if (!token) return reply.code(401).send({ error: "Unauthorized" });

    const user = await fetchSupabaseUser(token);
    if (!user) return reply.code(401).send({ error: "Unauthorized" });

    request.userId = user.id;
    request.userEmail = user.email;
    request.userName = user.name;

    if (user.email) {
      await supabase.from("project_members").update({ user_id: user.id }).eq("email", user.email).is("user_id", null);
    }
  });
});
