export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Shape RTK Query's `.unwrap()` throws (see store/axiosBaseQuery.ts) — a plain rejected-action payload, not an ApiError instance. */
interface RtkQueryError {
  status: number;
  message: string;
  code?: string;
}

function isRtkQueryError(err: unknown): err is RtkQueryError {
  return typeof err === "object" && err !== null && "status" in err && typeof (err as RtkQueryError).message === "string";
}

/** Turns any caught error into a user-facing message — pass a fallback for non-API errors (network failures, etc). */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (isRtkQueryError(err)) return err.message;
  return fallback;
}
