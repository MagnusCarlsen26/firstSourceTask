import { z } from "zod";

export const RemediationStateZod = z.object({
  toolName: z.string().optional(),
  succeeded: z.boolean().optional(),
});

export type RemediationState = z.infer<typeof RemediationStateZod>;
