import { MainState } from "../../shared/schema.js";

export async function handleUserInfo(
  state: Pick<MainState, "query">,
): Promise<Partial<MainState>> {
  const userInfo = state.query.userInfo!;

  // TODO: read from the user's profile / orders using `userInfo.request`.
  const result = `[UserInfo dummy answer] for request: "${userInfo.request}"`;

  return {
    query: { userInfo: { ...userInfo, result } },
  };
}
