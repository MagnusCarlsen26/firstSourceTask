import { z } from "zod";

export const AssistanceZod = z.object({
  needed: z
    .boolean()
    .describe("Whether this resource is needed to answer the query."),
  request: z
    .string()
    .describe("What specifically to look up / fetch from this resource."),
  result: z
    .string()
    .optional()
    .describe("Filled in by the sub-agent that handles this request."),
});

export const QueryStateZod = z.object({
  faq: AssistanceZod.optional(),
  userInfo: AssistanceZod.optional(),
  answer: z.string().optional(),
});

export type QueryState = z.infer<typeof QueryStateZod>;
