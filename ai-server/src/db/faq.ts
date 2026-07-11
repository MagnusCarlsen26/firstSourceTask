import { readFileSync } from "node:fs";

export interface FaqEntry {
  category: string;
  question: string;
  answer: string;
}

export const faqEntries: FaqEntry[] = JSON.parse(
  readFileSync(new URL("./faq.json", import.meta.url), "utf-8"),
);
