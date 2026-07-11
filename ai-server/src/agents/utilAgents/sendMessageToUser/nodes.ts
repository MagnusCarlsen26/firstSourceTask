import type { MainState } from "../../shared/schema.js";
import { sendResponseToUser } from "@/utils/sendResponseToUser";

export async function sendMessage(
  state: Pick<MainState, "util" | "chatHistory">,
): Promise<Pick<MainState, "util" | "chatHistory">> {
  const message = state.util.nextMessage;

  const isSuccess = await sendResponseToUser(message);

  if (!isSuccess) {
    throw new Error(`Error: Failed to send message to user: "${message}"`);
  }

  return {
    chatHistory: [...state.chatHistory, { author: "system", message }],
    util: { ...state.util, nextMessage: "" },
  };
}
