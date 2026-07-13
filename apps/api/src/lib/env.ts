import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Optional: powers real AI widget suggestions (see lib/aiSuggest.ts). Groq
  // hosts open-source models (Llama, etc.) behind a free-tier, OpenAI-compatible
  // API — no self-hosted inference server required. Suggestions fall back to a
  // deterministic, data-aware heuristic whenever this is unset or a call fails.
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
});

export const env = envSchema.parse(process.env);
