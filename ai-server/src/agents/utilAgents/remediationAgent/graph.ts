import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "@/agents/shared/schema";
import { runRemediation } from "./nodes.js";
import { routeAfterRemediation } from "./router/routeAfterRemediation.js";
import { sendMessageGraph } from "../sendMessageToUser/graph.js";
import { humanEscalationGraph } from "../humanEscalationAgent/graph.js";

const builder = new StateGraph(MainStateZod)
  .addNode("runRemediation", runRemediation)
  .addNode("send", sendMessageGraph)
  .addNode("escalate", humanEscalationGraph)

  .addEdge(START, "runRemediation")
  .addEdge("runRemediation", "send")
  .addConditionalEdges("send", routeAfterRemediation, {
    done: END,
    escalate: "escalate",
  })
  .addEdge("escalate", END);

export const remediationGraph = builder.compile();
