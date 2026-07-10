import { MainState } from "@/agents/shared/schema";
import { RELIABLE_CLASSIFICATION_THRESHOLD } from "@/config/config";

/**
 * If the confidence is less than RELIABLE_CLASSIFICATION_THRESHOLD we ask the
 * user for more clarification.
 */
export function isReliableClassification(
  state: Pick<MainState, "intent">,
): Pick<MainState, "intent"> {
  const confidence = state.intent.confidence;

  if (!(confidence >= 0 && confidence <= 1)) {
    throw new Error(
      `Error: Confidence value should be in [0, 1]. Received: ${confidence}`,
    );
  }

  return {
    intent: {
      ...state.intent,
      isReliable: confidence >= RELIABLE_CLASSIFICATION_THRESHOLD,
    },
  };
}
