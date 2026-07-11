import { openAIClient } from "@/llm/openai";
import { getLastUserMessage } from "@/agents/intentClassifierAgent/utils/getLastUserMessage";
import { ResourcePlanZod } from "@/agents/shared/resourceSchema";
import { MainState } from "@/agents/shared/schema";
import { SYSTEM_PROMPT } from "./prompt.js";

export async function planValidation(
  state: Pick<MainState, "chatHistory">,
): Promise<Partial<MainState>> {
  const request = getLastUserMessage(state.chatHistory);

  const structuredLlm = openAIClient.withStructuredOutput(ResourcePlanZod);
  const plan = await structuredLlm.invoke([
    ["system", SYSTEM_PROMPT],
    ["human", request],
  ]);

  return {
    complaint: {
      validation: {
        request,
        faq: { needed: plan.faq.needed, request: plan.faq.request },
        userInfo: {
          needed: plan.userInfo.needed,
          request: plan.userInfo.request,
        },
      },
    },
  };
}
