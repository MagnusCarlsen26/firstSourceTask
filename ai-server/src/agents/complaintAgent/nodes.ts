import { MainState } from "../shared/schema.js";
import { COMPLAINT_HOLD_MESSAGE } from "@/config/config";

export async function prepareHold(
  state: Pick<MainState, "util">,
): Promise<Partial<MainState>> {
  return {
    util: { ...state.util, nextMessage: COMPLAINT_HOLD_MESSAGE },
  };
}
