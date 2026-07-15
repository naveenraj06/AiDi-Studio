import { randomBytes } from "node:crypto";
import { hashPassword } from "./password.js";

const PREFIX_BYTES = 6;
const SECRET_BYTES = 24;

/** Generates a new SDK API key: `aidi_<prefix>_<secret>`. The prefix is stored
 * in plaintext so keys can be told apart in the UI; only the bcrypt hash of
 * the full secret is stored, mirroring how dashboard share passwords are kept
 * (see lib/password.ts) — the raw secret is shown to the user exactly once. */
export async function generateApiKey() {
  const prefix = randomBytes(PREFIX_BYTES).toString("hex");
  const secret = randomBytes(SECRET_BYTES).toString("hex");
  const key = `aidi_${prefix}_${secret}`;
  const keyHash = await hashPassword(key);
  return { key, prefix, keyHash };
}

export function parseApiKeyPrefix(key: string): string | null {
  const parts = key.split("_");
  if (parts.length !== 3 || parts[0] !== "aidi") return null;
  return parts[1];
}
