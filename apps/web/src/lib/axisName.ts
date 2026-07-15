const ACRONYMS = new Set([
  "ID",
  "URL",
  "URI",
  "API",
  "USD",
  "EUR",
  "GBP",
  "IP",
  "SKU",
  "UUID",
  "HTML",
  "CSS",
  "JS",
  "JSON",
  "XML",
  "SQL",
  "HTTP",
  "HTTPS",
  "PDF",
  "CSV",
  "GPS",
  "ROI",
  "CPU",
  "RAM",
  "US",
  "UK",
  "EU",
  "OS",
  "SLA",
]);

function capitalizeWord(word: string): string {
  const upper = word.toUpperCase();
  if (ACRONYMS.has(upper)) return upper;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Turns a raw API field name (snake_case, camelCase, kebab-case, or any mix)
 * into a human-readable chart axis label, e.g. "revenue_usd" -> "Revenue USD",
 * "createdAt" -> "Created At".
 */
export function nameAxis(field: string): string {
  if (!field) return "";
  const words = field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.map(capitalizeWord).join(" ");
}
