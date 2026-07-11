import { openAIClient } from "@/llm/openai";
import { userProfile } from "@/db/userProfile";
import { tools, toolsByName } from "@/tools";
import { MainState } from "@/agents/shared/schema";
import { SYSTEM_PROMPT } from "./prompt.js";

const ERROR_MESSAGE =
  "We're sorry — an error occurred while processing your request. One of our " +
  "human support agents is now reviewing it and will follow up with you shortly.";

export async function runRemediation(
  state: Pick<MainState, "complaint" | "util">,
): Promise<Partial<MainState>> {
  const verdict = state.complaint.validation?.verdict;

  const modelWithTools = openAIClient.bindTools(tools);
  const response = await modelWithTools.invoke([
    ["system", SYSTEM_PROMPT],
    [
      "human",
      `Approved action to perform:\n${verdict?.internalAction ?? "(none)"}\n\n` +
        `Customer & order data:\n${JSON.stringify(userProfile)}`,
    ],
  ]);

  const call = response.tool_calls?.[0];

  let succeeded = false;
  if (call) {
    const selectedTool = toolsByName[call.name];
    if (selectedTool) {
      try {
        await selectedTool.invoke(call.args);
        succeeded = true;
      } catch {
        succeeded = false;
      }
    }
  }

  const message = succeeded
    ? `We're glad to let you know this has now been resolved for you: ${
        verdict?.customerAction ?? "your requested resolution has been applied"
      }`
    : ERROR_MESSAGE;

  return {
    complaint: {
      ...state.complaint,
      remediation: { toolName: call?.name, succeeded },
    },
    util: { ...state.util, nextMessage: message },
  };
}
