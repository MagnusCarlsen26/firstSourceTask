import { z } from "zod";

import { MAX_USER_MESSAGE_LENGTH } from "@/config/config";
import { ClassificationZod } from "@/agents/intentClassifierAgent/schema";
import { UtilStateZod } from "@/agents/utilAgents/sendMessageToUser/schema";

const ChatHistoryZod = z.array(
  z.object({
    author: z.enum(["user", "system"]),
    message: z
      .string()
      .max(
        MAX_USER_MESSAGE_LENGTH,
        `Message must be less then ${MAX_USER_MESSAGE_LENGTH} characters`,
      ),
  }),
);

const IntentStateZod = ClassificationZod.extend({
  isReliable: z.boolean().optional(),
});

export const MainStateZod = z.object({
  chatHistory: ChatHistoryZod,
  intent: IntentStateZod,
  util: UtilStateZod,
});

export type MainState = z.infer<typeof MainStateZod>;
