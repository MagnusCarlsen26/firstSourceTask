import { openAIClient } from "../../../llm/openai.js";
import { getLastUserMessage } from "../../intentClassifierAgent/utils/getLastUserMessage.js";
import { MainState } from "../../shared/schema.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { QueryPlanZod } from "./schema.js";


export async function planQuery(
  state: Pick<MainState, "chatHistory">,
): Promise<Partial<MainState>> {
  const message = getLastUserMessage(state.chatHistory);

  const structuredLlm = openAIClient.withStructuredOutput(QueryPlanZod);

  const plan = await structuredLlm.invoke([
    ["system", SYSTEM_PROMPT],
    ["human", message],
  ]);

  return {
    query: {
      faq: { needed: plan.faq.needed, request: plan.faq.request },
      userInfo: {
        needed: plan.userInfo.needed,
        request: plan.userInfo.request,
      },
    },
  };
}
