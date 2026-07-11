import { z } from "zod";
import { ValidationStateZod } from "../utilAgents/validationAgent/schema.js";
import { RemediationStateZod } from "../utilAgents/remediationAgent/schema.js";

export const ComplaintStateZod = z.object({
  validation: ValidationStateZod.optional(),
  remediation: RemediationStateZod.optional(),
});

export type ComplaintState = z.infer<typeof ComplaintStateZod>;
