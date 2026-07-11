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

export function findLastUserMessage(chatHistory: ChatHistory): string {
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const entry = chatHistory[i];
    if (entry?.author === "user") {
      return entry.message;
    }
  }

  throw new Error("No user message found in chat history");
}
