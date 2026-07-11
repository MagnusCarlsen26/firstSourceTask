import { MainState } from "@/agents/shared/schema";

export function routeAfterRemediation(
  state: Pick<MainState, "complaint">,
): "done" | "escalate" {
  return state.complaint.remediation?.succeeded ? "done" : "escalate";
}
