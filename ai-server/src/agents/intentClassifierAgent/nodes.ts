import { openAIClient } from "../../llm/openai.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { getLastUserMessage } from "./utils/getLastUserMessage.js";
import { ClassificationZod } from "./schema.js";
import { MainState } from "../shared/schema.js";

export async function classifyNode(
  state: Pick<MainState, "chatHistory">,
): Promise<Partial<MainState>> {
  const message = getLastUserMessage(state.chatHistory);

  const structuredLlm = openAIClient.withStructuredOutput(ClassificationZod);

  const result = await structuredLlm.invoke([
    ["system", SYSTEM_PROMPT],
    ["human", message],
  ]);

  return {
    intent: {
      category: result.category,
      confidence: result.confidence,
      urgency: result.urgency,
      reason: result.reason,
    },
  };
}
