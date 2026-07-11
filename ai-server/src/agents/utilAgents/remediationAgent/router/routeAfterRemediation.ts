import { MainState } from "@/agents/shared/schema";

export function routeAfterRemediation(
  state: Pick<MainState, "resolution">,
): "done" | "escalate" {
  return state.resolution.remediation?.succeeded ? "done" : "escalate";
}
