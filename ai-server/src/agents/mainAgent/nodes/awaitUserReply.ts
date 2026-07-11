import { interrupt } from "@langchain/langgraph";
import { MainState } from "@/agents/shared/schema";

export function awaitUserReply(
  state: Pick<MainState, "chatHistory" | "intent">,
): Pick<MainState, "chatHistory" | "intent"> {
  const reply = interrupt<string, string>("Waiting for the user's reply");

  return {
    chatHistory: [...state.chatHistory, { author: "user", message: reply }],
    intent: {
      ...state.intent,
      clarificationAttempt: (state.intent.clarificationAttempt ?? 0) + 1,
    },
  };
}
