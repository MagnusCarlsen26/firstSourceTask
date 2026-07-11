import { z } from "zod";
import { AssistanceZod } from "@/agents/shared/resourceSchema";

export const EligibilityZod = z.enum([
  "FULLY_ELIGIBLE",
  "PARTIALLY_ELIGIBLE",
  "NOT_ELIGIBLE",
  "NEEDS_HUMAN",
]);

export const VerdictZod = z.object({
  eligibility: EligibilityZod.describe(
    "How eligible the customer is for what they requested.",
  ),
  reason: z
    .string()
    .describe("Supporting justification for the verdict, grounded in the gathered evidence."),
  customerAction: z
    .string()
    .describe(
      "What we tell the customer we will do, phrased for them politely — " +
        "e.g. the remedy being applied, or that it is being escalated.",
    ),
  internalAction: z
    .string()
    .describe(
      "The instruction handed to our internal team to actually carry out — " +
        "the concrete operational step (e.g. issue full refund of the item " +
        "amount to the original payment method for order ORD-XXXX).",
    ),
});

export const ValidationStateZod = z.object({
  request: z.string().optional(),
  faq: AssistanceZod.optional(),
  userInfo: AssistanceZod.optional(),
  verdict: VerdictZod.optional(),
});

export type ValidationState = z.infer<typeof ValidationStateZod>;
export type Verdict = z.infer<typeof VerdictZod>;
