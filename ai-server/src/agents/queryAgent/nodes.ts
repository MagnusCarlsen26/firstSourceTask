import { MainState } from "../shared/schema.js";

export async function handleQuery(
  state: Pick<MainState, "chatHistory" | "intent">,
): Promise<Partial<MainState>> {
  // TODO: implement query handling.
  return {};
}
