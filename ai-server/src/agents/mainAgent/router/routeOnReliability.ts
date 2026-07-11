import { END } from "@langchain/langgraph";
import { MainState } from "@/agents/shared/schema";
import { MAX_CLARIFICATION_ATTEMPTS } from "@/config/config";


export function routeOnReliability(
  state: Pick<MainState, "intent">,
): "query" | "complaint" | "clarify" | "exhausted" | typeof END {
  if (state.intent.isReliable) {
    switch (state.intent.category) {
      case "QUERY":
        return "query";
      case "COMPLAINT":
        return "complaint";
      default:
        return END;
    }
  }

  const clarificationAttempt = state.intent.clarificationAttempt ?? 0;
  return clarificationAttempt >= MAX_CLARIFICATION_ATTEMPTS
    ? "exhausted"
    : "clarify";
}
