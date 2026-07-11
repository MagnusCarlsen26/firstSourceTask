import { END } from "@langchain/langgraph";
import { MainState } from "@/agents/shared/schema";
import { MAX_CLARIFICATION_ATTEMPTS } from "@/config/config";


export function routeOnReliability(
  state: Pick<MainState, "intent">,
): "query" | "clarify" | "exhausted" | typeof END {
  if (state.intent.isReliable) {
    return state.intent.category === "QUERY" ? "query" : END;
  }

  const clarificationAttempt = state.intent.clarificationAttempt ?? 0;
  return clarificationAttempt >= MAX_CLARIFICATION_ATTEMPTS
    ? "exhausted"
    : "clarify";
}
