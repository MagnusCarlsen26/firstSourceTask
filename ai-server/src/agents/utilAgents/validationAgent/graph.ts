import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "@/agents/shared/schema";
import { planValidation } from "./planner/nodes.js";
import { gatherEvidence, decideVerdict } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("plan", planValidation)
  .addNode("gather", gatherEvidence)
  .addNode("decide", decideVerdict)

  .addEdge(START, "plan")
  .addEdge("plan", "gather")
  .addEdge("gather", "decide")
  .addEdge("decide", END);

export const validationGraph = builder.compile();
