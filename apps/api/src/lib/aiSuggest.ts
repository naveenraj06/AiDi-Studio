import { z } from "zod";
import { env } from "./env.js";
import { WIDGET_TYPES } from "./widgetTypes.js";
import { roleRequirementsGuide, satisfiesRoleRequirements } from "./widgetSuggestRoles.js";
import { heuristicSuggest, type HeuristicSuggestion } from "./heuristicSuggest.js";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface WidgetSuggestionResult extends HeuristicSuggestion {
  /** True when this came from the LLM; false whenever the deterministic fallback ran. */
  usedAi: boolean;
}

const aiResponseSchema = z.object({
  suggestedType: z.enum(WIDGET_TYPES),
  confidence: z.number().min(0).max(100),
  reasoning: z.string().trim().min(1).max(400),
  alternatives: z.array(z.enum(WIDGET_TYPES)).max(4),
  mapping: z
    .array(z.object({ field: z.string().trim().min(1), role: z.string().trim().min(1) }))
    .max(8),
});

/** Keeps the sample small — this is a schema-shape hint for the model, not a data export. */
function truncateSample(sample: unknown): unknown {
  if (Array.isArray(sample)) return sample.slice(0, 5);
  if (sample && typeof sample === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(sample as Record<string, unknown>)) {
      out[key] = Array.isArray(value) ? value.slice(0, 5) : value;
    }
    return out;
  }
  return sample;
}

function buildPrompt(resourceName: string, sample: unknown) {
  const system = `You are a dashboard widget recommendation engine for an API analytics product. Given an API resource's name and a sample of its real JSON response, pick the single best widget component type and a field mapping.

Available component types: ${WIDGET_TYPES.join(", ")}.

Each type expects specific mapping roles, using the resource's REAL field names — never invent a field name that isn't in the sample:
${roleRequirementsGuide()}
- any other type: leave mapping empty (it shows the raw fields as-is)

Respond with ONLY a JSON object, no prose, matching exactly:
{"suggestedType": "<one type from the list above>", "confidence": <integer 0-100>, "reasoning": "<one sentence, naming the actual field(s) you used>", "alternatives": [<0-3 other plausible types>], "mapping": [{"field": "<real field name from the sample>", "role": "<role from the guide above>"}]}`;

  const user = `Resource name: ${resourceName}\n\nSample response (truncated):\n${JSON.stringify(truncateSample(sample)).slice(0, 4000)}`;

  return { system, user };
}

async function callGroq(resourceName: string, sample: unknown): Promise<WidgetSuggestionResult> {
  const { system, user } = buildPrompt(resourceName, sample);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error(`Groq responded with ${res.status}`);

  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = body.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Malformed Groq response");

  const parsed = aiResponseSchema.parse(JSON.parse(content));

  // A syntactically valid response can still be useless if the mapping
  // doesn't actually cover what the chosen widget type needs to render.
  if (!satisfiesRoleRequirements(parsed.suggestedType, parsed.mapping)) {
    throw new Error("AI mapping missing required roles for its suggested type");
  }

  return { ...parsed, usedAi: true };
}

/**
 * Real AI suggestion when GROQ_API_KEY is configured, with an automatic,
 * silent fallback to the deterministic heuristic on any missing config,
 * network failure, timeout, or invalid/unusable model output. Callers always
 * get a usable suggestion; `usedAi` says which path produced it.
 */
export async function suggestWidgetForResource(resourceName: string, sample: unknown): Promise<WidgetSuggestionResult> {
  if (!env.GROQ_API_KEY) {
    return { ...heuristicSuggest(sample), usedAi: false };
  }

  try {
    return await callGroq(resourceName, sample);
  } catch {
    return { ...heuristicSuggest(sample), usedAi: false };
  }
}
