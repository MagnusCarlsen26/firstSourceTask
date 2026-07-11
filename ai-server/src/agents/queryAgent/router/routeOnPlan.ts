import { MainState } from "../../shared/schema.js";


export function routeAfterPlan(
  state: Pick<MainState, "query">,
): Array<"faq" | "userInfo" | "compose"> {
  const targets: Array<"faq" | "userInfo"> = [];

  if (state.query.faq?.needed) {
    targets.push("faq");
  }
  if (state.query.userInfo?.needed) {
    targets.push("userInfo");
  }

  return targets.length > 0 ? targets : ["compose"];
}
