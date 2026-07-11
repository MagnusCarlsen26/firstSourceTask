import { MainState } from "@/agents/shared/schema";

type ChatHistory = MainState["chatHistory"];
export function getLastUserMessage(chatHistory: ChatHistory): string {
  const lastMessage = chatHistory[chatHistory.length - 1];
  if (!lastMessage) {
    throw new Error("Received empty chat history");
  }

  if (lastMessage.author === "system") {
    throw new Error("Last message expected to be from user but its from system.")
  }

  return lastMessage.message;
}
