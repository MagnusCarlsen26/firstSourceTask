import { interrupt } from "@langchain/langgraph";
import { MainState } from "../shared/schema.js";
import {
  COMPLAINT_HOLD_MESSAGE,
  COMPLAINT_CONFIRMATION_MESSAGE,
} from "@/config/config";

export async function prepareHold(
  state: Pick<MainState, "util">,
): Promise<Partial<MainState>> {
  return {
    util: { ...state.util, nextMessage: COMPLAINT_HOLD_MESSAGE },
  };
}

export async function askConfirmation(
  state: Pick<MainState, "util">,
): Promise<Partial<MainState>> {
  return {
    util: { ...state.util, nextMessage: COMPLAINT_CONFIRMATION_MESSAGE },
  };
}

export function awaitConfirmation(
  state: Pick<MainState, "chatHistory">,
): Pick<MainState, "chatHistory"> {
  const reply = interrupt<string, string>(
    "Waiting for the user's yes/no confirmation",
  );

  return {
    chatHistory: [...state.chatHistory, { author: "user", message: reply }],
  };
}
