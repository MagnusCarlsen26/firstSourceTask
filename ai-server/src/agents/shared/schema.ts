import { z } from "zod";
import { withLangGraph } from "@langchain/langgraph/zod";

import { MAX_USER_MESSAGE_LENGTH } from "@/config/config";
import { ClassificationZod } from "@/agents/intentClassifierAgent/schema";
import { UtilStateZod } from "@/agents/utilAgents/sendMessageToUser/schema";
import { QueryStateZod, QueryState } from "@/agents/queryAgent/schema";
import {
  ResolutionStateZod,
  ResolutionState,
} from "@/agents/shared/resolutionSchema";

const ChatHistoryZod = z.array(
  z
    .object({
      author: z.enum(["user", "system"]),
      message: z.string(),
    })
    .superRefine((entry, ctx) => {
      if (
        entry.author === "user" &&
        entry.message.length > MAX_USER_MESSAGE_LENGTH
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: MAX_USER_MESSAGE_LENGTH,
          type: "string",
          inclusive: true,
          message: `Message must be less then ${MAX_USER_MESSAGE_LENGTH} characters`,
        });
      }
    }),
);

const IntentStateZod = ClassificationZod.extend({
  isReliable: z.boolean().optional(),
  clarificationAttempt: z.number().int().min(0).optional(),
});

export const MainStateZod = z.object({
  chatHistory: ChatHistoryZod,
  intent: IntentStateZod,
  util: UtilStateZod,
  query: withLangGraph(QueryStateZod, {
    reducer: {
      fn: (a: QueryState, b: QueryState): QueryState => ({ ...a, ...b }),
    },
    default: (): QueryState => ({}),
  }),
  resolution: withLangGraph(ResolutionStateZod, {
    reducer: {
      fn: (a: ResolutionState, b: ResolutionState): ResolutionState => ({
        ...a,
        ...b,
      }),
    },
    default: (): ResolutionState => ({}),
  }),
});

export type MainState = z.infer<typeof MainStateZod>;
