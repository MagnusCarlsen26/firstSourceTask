import { openAIClient } from "@/llm/openai";
import { userProfile } from "@/db/userProfile";
import { SYSTEM_PROMPT } from "./prompt.js";
import { UserInfoSelectionZod } from "./schema.js";
import { listPaths, pickPaths } from "./utils/paths.js";

export async function runUserInfoFetcher(request: string): Promise<string> {
  const availableKeys = listPaths(userProfile);

  const structuredLlm = openAIClient.withStructuredOutput(UserInfoSelectionZod);
  const { keys } = await structuredLlm.invoke([
    [
      "system",
      `${SYSTEM_PROMPT}\n\nAvailable keys:\n${availableKeys.join("\n")}`,
    ],
    ["human", request],
  ]);

  const picked = pickPaths(userProfile, keys);

  return JSON.stringify(picked);
}
