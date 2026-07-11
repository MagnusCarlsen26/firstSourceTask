import { z } from "zod";

const AssistanceRequestZod = z.object({
  needed: z.boolean().describe("Whether this resource is needed."),
  request: z
    .string()
    .describe(
      "A self-contained instruction describing exactly what to look up / " +
        "fetch from this resource. Empty when not needed.",
    ),
});

export const QueryPlanZod = z.object({
  faq: AssistanceRequestZod.describe(
    "Help from the FAQ / knowledge base (general rules, policies, no user context).",
  ),
  userInfo: AssistanceRequestZod.describe(
    "Help from the user info fetcher (facts read from the user's profile / orders).",
  ),
});

export type QueryPlan = z.infer<typeof QueryPlanZod>;
