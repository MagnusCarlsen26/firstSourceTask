import { z } from "zod";

export const AssistanceZod = z.object({
  needed: z
    .boolean()
    .describe("Whether this resource is needed."),
  request: z
    .string()
    .describe("What specifically to look up / fetch from this resource."),
  result: z
    .string()
    .optional()
    .describe("Filled in by the sub-agent that handles this request."),
});

const AssistanceRequestZod = z.object({
  needed: z.boolean().describe("Whether this resource is needed."),
  request: z
    .string()
    .describe(
      "A self-contained instruction describing exactly what to look up / " +
        "fetch from this resource. Empty when not needed.",
    ),
});

export const ResourcePlanZod = z.object({
  faq: AssistanceRequestZod.describe(
    "Help from the FAQ / knowledge base (general rules, policies, no user context).",
  ),
  userInfo: AssistanceRequestZod.describe(
    "Help from the user info fetcher (facts read from the user's profile / orders).",
  ),
});

export type ResourcePlan = z.infer<typeof ResourcePlanZod>;
