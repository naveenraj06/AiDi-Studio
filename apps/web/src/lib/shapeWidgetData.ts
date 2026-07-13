import type { FieldMapping } from "@/types";

export type ShapedRow = Record<string, string | number>;

/** Finds the array-of-objects worth charting inside an arbitrary API response:
 * the response itself if it's already an array, the first array-valued property
 * otherwise, or the response treated as a single row as a last resort. */
function findRecords(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null);
  }
  if (raw && typeof raw === "object") {
    for (const value of Object.values(raw as Record<string, unknown>)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        return value as Record<string, unknown>[];
      }
    }
    return [raw as Record<string, unknown>];
  }
  return [];
}

function coerce(value: unknown): string | number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return value.trim() !== "" && !Number.isNaN(n) ? n : value;
  }
  if (value == null) return "";
  return String(value);
}

/**
 * Turns a resource's raw JSON response into flat rows keyed by mapping role
 * (x-axis, y-axis, label, value, series, ...) instead of the original field
 * names, so every widget renderer can read `row["y-axis"]` regardless of what
 * the underlying API actually calls that field.
 */
export function shapeWidgetRows(raw: unknown, mapping: FieldMapping[] | null | undefined): ShapedRow[] {
  const records = findRecords(raw);
  if (!mapping || mapping.length === 0) {
    return records.map((record) => {
      const row: ShapedRow = {};
      for (const [key, value] of Object.entries(record)) row[key] = coerce(value);
      return row;
    });
  }
  return records.map((record) => {
    const row: ShapedRow = {};
    for (const { field, role } of mapping) row[role] = coerce(record[field]);
    return row;
  });
}

/** First numeric value found under any of the given roles, across rows, in order. */
export function pickNumber(rows: ShapedRow[], roles: string[], fallback: number): number {
  for (const row of rows) {
    for (const role of roles) {
      const v = row[role];
      if (typeof v === "number") return v;
    }
  }
  return fallback;
}

/** First defined value (string or number) under any of the given roles — undefined if none present,
 * so callers can tell "no data mapped" apart from a real 0/"" value. */
export function pickRaw(rows: ShapedRow[], roles: string[]): string | number | undefined {
  for (const row of rows) {
    for (const role of roles) {
      const v = row[role];
      if (v !== undefined && v !== "") return v;
    }
  }
  return undefined;
}

/** Field names available on the first record of a raw response — used to help
 * a user adjust field mapping against what a resource actually returns. */
export function inferFieldNames(raw: unknown): string[] {
  const [first] = findRecords(raw);
  return first ? Object.keys(first) : [];
}
