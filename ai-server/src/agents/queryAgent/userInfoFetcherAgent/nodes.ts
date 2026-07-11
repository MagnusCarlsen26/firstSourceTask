import { openAIClient } from "../../../llm/openai.js";
import { userProfile } from "../../../db/userProfile.js";
import { MainState } from "../../shared/schema.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { UserInfoSelectionZod } from "./schema.js";
import { listPaths, pickPaths } from "./utils/paths.js";

export async function handleUserInfo(
  state: Pick<MainState, "query">,
): Promise<Partial<MainState>> {
  const userInfo = state.query.userInfo!;

  const availableKeys = listPaths(userProfile);

  const structuredLlm = openAIClient.withStructuredOutput(UserInfoSelectionZod);
  const { keys } = await structuredLlm.invoke([
    ["system", `${SYSTEM_PROMPT}\n\nAvailable keys:\n${availableKeys.join("\n")}`],
    ["human", userInfo.request],
  ]);

  const picked = pickPaths(userProfile, keys);
  const result = JSON.stringify(picked);

  return {
    query: { userInfo: { ...userInfo, result } },
  };
}
