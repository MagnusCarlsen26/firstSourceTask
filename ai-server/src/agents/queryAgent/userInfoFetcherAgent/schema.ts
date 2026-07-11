import { z } from "zod";

export const UserInfoSelectionZod = z.object({
  keys: z
    .array(z.string())
    .describe(
      "The dot-paths, taken exactly from the provided list of available keys, " +
        "whose values are needed to answer the request.",
    ),
});
