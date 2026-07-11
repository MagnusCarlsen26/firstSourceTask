import { MainState } from "../../shared/schema.js";

export function routeAfterVerdict(
  state: Pick<MainState, "complaint">,
): "human" | "confirm" {
  return state.complaint.validation?.verdict?.eligibility === "NEEDS_HUMAN"
    ? "human"
    : "confirm";
}
