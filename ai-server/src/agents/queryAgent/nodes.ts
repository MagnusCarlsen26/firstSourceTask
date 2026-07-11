import { StringOutputParser } from "@langchain/core/output_parsers";
import { openAIClient } from "../../llm/openai.js";
import { getLastUserMessage } from "../intentClassifierAgent/utils/getLastUserMessage.js";
import { MainState } from "../shared/schema.js";
import { SYSTEM_PROMPT } from "./prompt.js";

export async function composeAnswer(
  state: Pick<MainState, "util" | "query" | "chatHistory">,
): Promise<Partial<MainState>> {
  const question = getLastUserMessage(state.chatHistory);

  const context = [
    state.query.faq?.result && `FAQ knowledge:\n${state.query.faq.result}`,
    state.query.userInfo?.result &&
      `Customer data (dot-path: value):\n${state.query.userInfo.result}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const answer = await openAIClient.pipe(new StringOutputParser()).invoke([
    ["system", SYSTEM_PROMPT],
    ["human", `Customer question: ${question}\n\n${context}`],
  ]);

  return {
    query: { answer },
    util: { ...state.util, nextMessage: answer },
  };
}
