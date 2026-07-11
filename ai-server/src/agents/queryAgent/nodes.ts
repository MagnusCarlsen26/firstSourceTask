import { MainState } from "../shared/schema.js";

export async function composeAnswer(
  state: Pick<MainState, "util" | "query">,
): Promise<Partial<MainState>> {
  // TODO: synthesize the answer from state.query.faq.result and
  // state.query.userInfo.result.
  const answer = [state.query.faq?.result, state.query.userInfo?.result]
    .filter(Boolean)
    .join(" | ");

  // Stage the answer for the send-message util agent that runs next.
  return {
    query: { answer },
    util: { ...state.util, nextMessage: answer },
  };
}
