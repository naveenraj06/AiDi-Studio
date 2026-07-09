import { randomBytes } from "node:crypto";

export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "dashboard";
}

export function randomSuffix() {
  return randomBytes(3).toString("hex");
}
