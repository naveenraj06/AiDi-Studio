import type { WidgetTypeValue } from "./widgetTypes.js";

export interface HeuristicSuggestion {
  suggestedType: WidgetTypeValue;
  confidence: number;
  reasoning: string;
  alternatives: WidgetTypeValue[];
  mapping: { field: string; role: string }[];
}

/** Finds the array-of-records worth charting inside an arbitrary API response. */
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

function looksLikeDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}/.test(value) || (/[-/]/.test(value) && !Number.isNaN(Date.parse(value)));
}

function isNumeric(value: unknown): boolean {
  if (typeof value === "number") return true;
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value));
}

/**
 * Deterministic fallback for when AI suggestions are unavailable or fail —
 * inspects the REAL fetched sample's field names and types (not just the
 * resource's name) to pick a widget type and a mapping that uses actual
 * field names. Used directly when GROQ_API_KEY isn't set, and as the safety
 * net when the AI call errors, times out, or returns something invalid.
 */
export function heuristicSuggest(sample: unknown): HeuristicSuggestion {
  const records = findRecords(sample);
  const first = records[0];

  if (!first) {
    return {
      suggestedType: "table",
      confidence: 40,
      reasoning: "Couldn't find a usable record shape in the sample response.",
      alternatives: ["list", "stat"],
      mapping: [],
    };
  }

  const fields = Object.keys(first);
  const dateField = fields.find((f) => looksLikeDate(first[f]));
  const numericFields = fields.filter((f) => f !== dateField && isNumeric(first[f]));
  const labelField = fields.find((f) => f !== dateField && !numericFields.includes(f) && typeof first[f] === "string");

  if (dateField && numericFields[0] && records.length > 1) {
    return {
      suggestedType: "line",
      confidence: 74,
      reasoning: `Detected a date-like field ("${dateField}") alongside a numeric field ("${numericFields[0]}") across ${records.length} records — a time series line chart best shows the trend.`,
      alternatives: ["area", "bar"],
      mapping: [
        { field: dateField, role: "x-axis" },
        { field: numericFields[0], role: "y-axis" },
      ],
    };
  }

  if (labelField && numericFields[0]) {
    if (records.length <= 8) {
      return {
        suggestedType: "donut",
        confidence: 68,
        reasoning: `Detected a label field ("${labelField}") and a numeric field ("${numericFields[0]}") with ${records.length} records — a donut chart shows composition well at this size.`,
        alternatives: ["bar", "table"],
        mapping: [
          { field: labelField, role: "label" },
          { field: numericFields[0], role: "value" },
        ],
      };
    }
    return {
      suggestedType: "bar",
      confidence: 70,
      reasoning: `Detected a categorical field ("${labelField}") paired with a numeric field ("${numericFields[0]}") across ${records.length} records — a bar chart compares them clearly.`,
      alternatives: ["table", "list"],
      mapping: [
        { field: labelField, role: "x-axis" },
        { field: numericFields[0], role: "y-axis" },
      ],
    };
  }

  if (records.length === 1 && numericFields[0]) {
    return {
      suggestedType: "stat",
      confidence: 65,
      reasoning: `Response is a single record with a numeric field ("${numericFields[0]}") and no time dimension — a stat card highlights the headline number.`,
      alternatives: ["gauge", "progress"],
      mapping: [{ field: numericFields[0], role: "value" }],
    };
  }

  return {
    suggestedType: "table",
    confidence: 55,
    reasoning: "Response is a set of records without an obvious chart shape — a table gives the most faithful view of every field.",
    alternatives: ["list", "bar"],
    mapping: [],
  };
}
