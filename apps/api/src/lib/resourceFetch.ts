import { assertPublicHttpUrl } from "./ssrfGuard.js";

export interface ResourceCredentials {
  url: string;
  auth_type: string;
  auth_credential: string | null;
}

export class ResourceFetchError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Fetches a resource's live JSON response server-side, with credentials
 * injected and never exposed to the browser. Shared by the raw data proxy
 * (widgets binding to live data) and the AI suggestion endpoint (which needs
 * a real sample to reason about).
 */
export async function fetchResourceJson(resource: ResourceCredentials): Promise<unknown> {
  let url: URL;
  try {
    url = assertPublicHttpUrl(resource.url);
  } catch (err) {
    throw new ResourceFetchError(400, err instanceof Error ? err.message : "Invalid resource URL");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (resource.auth_type === "bearer" && resource.auth_credential) {
    headers.Authorization = `Bearer ${resource.auth_credential}`;
  } else if (resource.auth_type === "api_key" && resource.auth_credential) {
    headers["X-API-Key"] = resource.auth_credential;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let res: Response;
  try {
    res = await fetch(url, { method: "GET", headers, signal: controller.signal });
  } catch {
    throw new ResourceFetchError(502, "Failed to reach resource");
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new ResourceFetchError(502, `Resource responded with ${res.status}`);

  // Cap the response we read — this is for dashboard widgets, not bulk data export.
  const text = await res.text();
  if (text.length > 1_000_000) throw new ResourceFetchError(502, "Resource response too large");

  try {
    return JSON.parse(text);
  } catch {
    throw new ResourceFetchError(502, "Resource did not return valid JSON");
  }
}
