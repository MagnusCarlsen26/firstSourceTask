import type { MainState } from "../../shared/schema.js";

export function sendMessage(
  state: Pick<MainState, "util">,
): Pick<MainState, "util"> {
  // Send message VIA API

  return { util: { ...state.util, isSucess: true } };
}
