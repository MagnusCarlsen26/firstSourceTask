import { z } from "zod";

export const IntentCategory = z.enum([
  "QUERY",
  "COMPLAINT",
  "SERVICE_REQUEST",
  "IRRELEVANT",
  "OTHER",
]);

export const ClassificationZod = z.object({
  category: IntentCategory.describe("Primary user intent."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score between 0 and 1."),
  reason: z.string().describe("Few sentences explaining the classification."),
});
