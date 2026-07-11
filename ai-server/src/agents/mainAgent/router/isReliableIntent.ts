import { MainState } from "@/agents/shared/schema";
import {
  RELIABLE_CLASSIFICATION_THRESHOLD,
  MAX_CLARIFICATION_ATTEMPTS,
  CLARIFICATION_MESSAGES,
  UNRESOLVED_CLARIFICATION_MESSAGE,
} from "@/config/config";


export function isReliableClassification(
  state: Pick<MainState, "intent" | "util">,
): Partial<Pick<MainState, "intent" | "util">> {
  const confidence = state.intent.confidence;

  if (!(confidence >= 0 && confidence <= 1)) {
    throw new Error(
      `Error: Confidence value should be in [0, 1]. Received: ${confidence}`,
    );
  }

  const isReliable = confidence >= RELIABLE_CLASSIFICATION_THRESHOLD;

  if (isReliable) {
    return { intent: { ...state.intent, isReliable: true } };
  }

  const clarificationAttempt = state.intent.clarificationAttempt ?? 0;
  const exhausted = clarificationAttempt >= MAX_CLARIFICATION_ATTEMPTS;

  const nextMessage =
    exhausted || !CLARIFICATION_MESSAGES[clarificationAttempt]
      ? UNRESOLVED_CLARIFICATION_MESSAGE
      : CLARIFICATION_MESSAGES[clarificationAttempt];

  return {
    intent: { ...state.intent, isReliable: false },
    util: { ...state.util, nextMessage },
  };
}
