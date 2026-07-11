import { z } from "zod";

export const IntentCategory = z.enum([
  "QUERY",
  "COMPLAINT",
  "SERVICE_REQUEST",
  "IRRELEVANT",
  "OTHER",
]);

export const UrgencyLevel = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const ClassificationZod = z.object({
  category: IntentCategory.describe("Primary user intent."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score between 0 and 1."),
  urgency: UrgencyLevel.describe(
    "How time-sensitive handling the message is: LOW, MEDIUM, or HIGH.",
  ),
  reason: z.string().describe("Few sentences explaining the classification."),
});
