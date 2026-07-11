import { MainState } from "../shared/schema.js";

export async function handleComplaint(
  state: Pick<MainState, "chatHistory" | "intent">,
): Promise<Partial<MainState>> {
  // TODO: implement complaint handling.
  return {};
}
