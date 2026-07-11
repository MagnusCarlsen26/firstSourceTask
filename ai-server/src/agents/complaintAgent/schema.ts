import { z } from "zod";
import { ValidationStateZod } from "../utilAgents/validationAgent/schema.js";

export const ComplaintStateZod = z.object({
  validation: ValidationStateZod.optional(),
});

export type ComplaintState = z.infer<typeof ComplaintStateZod>;
