import { MainState } from "@/agents/shared/schema";

type ChatHistory = MainState["chatHistory"];
export function getLastUserMessage(chatHistory: ChatHistory): string {
  const lastMessage = chatHistory[chatHistory.length - 1];
  if (!lastMessage) {
    throw new Error("Received empty chat history");
  }

  return lastMessage.message;
}
