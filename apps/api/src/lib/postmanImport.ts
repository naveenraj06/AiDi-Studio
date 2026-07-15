export interface ParsedEndpoint {
  name: string;
  method: string;
  url: string;
  authType: "bearer" | "api_key" | "oauth" | "none";
  authCredential?: string;
}

export class PostmanParseError extends Error {}

interface PostmanKeyValue {
  key?: string;
  value?: string;
}

interface PostmanAuth {
  type?: string;
  bearer?: PostmanKeyValue[];
  apikey?: PostmanKeyValue[];
}

interface PostmanRequest {
  method?: string;
  url?: string | { raw?: string };
  auth?: PostmanAuth;
  header?: PostmanKeyValue[];
}

interface PostmanItem {
  name?: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
}

function extractUrl(request: PostmanRequest): string | null {
  if (typeof request.url === "string") return request.url;
  return request.url?.raw ?? null;
}

function extractAuth(request: PostmanRequest): Pick<ParsedEndpoint, "authType" | "authCredential"> {
  const auth = request.auth;
  if (auth?.type === "bearer") {
    const token = auth.bearer?.find((e) => e.key === "token")?.value;
    return { authType: "bearer", authCredential: token };
  }
  if (auth?.type === "apikey") {
    const value = auth.apikey?.find((e) => e.key === "value")?.value;
    return { authType: "api_key", authCredential: value };
  }
  const headerAuth = request.header?.find((h) => h.key?.toLowerCase() === "authorization");
  if (headerAuth?.value && /^bearer\s+/i.test(headerAuth.value)) {
    return { authType: "bearer", authCredential: headerAuth.value.replace(/^bearer\s+/i, "").trim() };
  }
  return { authType: "none" };
}

function walk(items: PostmanItem[], out: ParsedEndpoint[]) {
  for (const item of items) {
    if (item.item) {
      walk(item.item, out);
      continue;
    }
    if (!item.request) continue;
    const url = extractUrl(item.request);
    if (!url) continue;
    out.push({
      name: item.name?.trim() || url,
      method: (item.request.method ?? "GET").toUpperCase(),
      url,
      ...extractAuth(item.request),
    });
  }
}

/** Parses a Postman Collection v2.1 export (nested folders included) into a
 * flat list of endpoints for the bulk-import checklist UI. */
export function parsePostmanCollection(json: unknown): ParsedEndpoint[] {
  if (typeof json !== "object" || json === null || !("item" in json)) {
    throw new PostmanParseError('This doesn\'t look like a Postman collection (missing top-level "item" array)');
  }
  const items = (json as { item?: unknown }).item;
  if (!Array.isArray(items)) {
    throw new PostmanParseError('This doesn\'t look like a Postman collection ("item" is not an array)');
  }

  const out: ParsedEndpoint[] = [];
  walk(items as PostmanItem[], out);
  if (out.length === 0) throw new PostmanParseError("No requests found in this collection");
  return out;
}
