import { MainState } from "../../shared/schema.js";
import { getLastUserMessage } from "../../intentClassifierAgent/utils/getLastUserMessage.js";

export function routeOnConfirmation(
  state: Pick<MainState, "chatHistory">,
): "yes" | "no" {
  const reply = getLastUserMessage(state.chatHistory).trim().toLowerCase();

  return reply === "yes" ? "yes" : "no";
}
