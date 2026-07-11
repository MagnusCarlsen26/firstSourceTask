import { MainState } from "@/agents/shared/schema";

export async function escalateToHuman(
  state: Pick<MainState, "resolution" | "chatHistory">,
): Promise<Partial<MainState>> {
  // TODO: open a ticket / hand this conversation off to a human support queue,
  // carrying the verdict and chat history as context.
  void state;

  return {};
}
