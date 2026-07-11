import { readFileSync } from "node:fs";

export const userProfile: Record<string, unknown> = JSON.parse(
  readFileSync(new URL("./userProfile.json", import.meta.url), "utf-8"),
);
