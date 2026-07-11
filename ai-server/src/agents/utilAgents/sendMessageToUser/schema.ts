import { z } from "zod";

export const UtilStateZod = z.object({
  nextMessage: z.string(),
});

export type UtilState = z.infer<typeof UtilStateZod>;
