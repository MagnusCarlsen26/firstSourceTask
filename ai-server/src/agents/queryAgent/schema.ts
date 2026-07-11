import { z } from "zod";
import { AssistanceZod } from "@/agents/shared/resourceSchema";

export const QueryStateZod = z.object({
  faq: AssistanceZod.optional(),
  userInfo: AssistanceZod.optional(),
  answer: z.string().optional(),
});

export type QueryState = z.infer<typeof QueryStateZod>;
