import { z } from "zod";
import { withLangGraph } from "@langchain/langgraph/zod";

import { MAX_USER_MESSAGE_LENGTH } from "@/config/config";
import { ClassificationZod } from "@/agents/intentClassifierAgent/schema";
import { UtilStateZod } from "@/agents/utilAgents/sendMessageToUser/schema";
import { QueryStateZod, QueryState } from "@/agents/queryAgent/schema";
import {
  ComplaintStateZod,
  ComplaintState,
} from "@/agents/complaintAgent/schema";

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
  complaint: withLangGraph(ComplaintStateZod, {
    reducer: {
      fn: (a: ComplaintState, b: ComplaintState): ComplaintState => ({
        ...a,
        ...b,
      }),
    },
    default: (): ComplaintState => ({}),
  }),
});

export type MainState = z.infer<typeof MainStateZod>;
