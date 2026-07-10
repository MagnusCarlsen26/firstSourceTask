import { z } from "zod";

export const UtilStateZod = z.object({
  message: z.string(),
  isSucess: z.boolean().optional(),
});

export type UtilState = z.infer<typeof UtilStateZod>;
