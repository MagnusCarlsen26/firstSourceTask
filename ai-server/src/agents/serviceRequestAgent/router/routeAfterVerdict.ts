import { MainState } from "../../shared/schema.js";

export function routeAfterVerdict(
  state: Pick<MainState, "resolution">,
): "human" | "confirm" {
  return state.resolution.validation?.verdict?.eligibility === "NEEDS_HUMAN"
    ? "human"
    : "confirm";
}
