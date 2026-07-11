import { MainState } from "../shared/schema.js";

export async function handleServiceRequest(
  state: Pick<MainState, "chatHistory" | "intent">,
): Promise<Partial<MainState>> {
  // TODO: implement service request handling.
  return {};
}
