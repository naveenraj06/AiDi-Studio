import type { FastifyReply, FastifyRequest } from "fastify";
import type { ZodSchema } from "zod";

export function parseBody<T>(schema: ZodSchema<T>, request: FastifyRequest, reply: FastifyReply): T | undefined {
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return undefined;
  }
  return parsed.data;
}
