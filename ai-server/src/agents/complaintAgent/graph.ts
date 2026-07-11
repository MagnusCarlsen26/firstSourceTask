import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../shared/schema.js";
import { prepareHold, askConfirmation, awaitConfirmation } from "./nodes.js";
import { routeAfterVerdict } from "./router/routeAfterVerdict.js";
import { routeOnConfirmation } from "./router/routeOnConfirmation.js";
import { sendMessageGraph } from "../utilAgents/sendMessageToUser/graph.js";
import { validationGraph } from "../utilAgents/validationAgent/graph.js";
import { remediationGraph } from "../utilAgents/remediationAgent/graph.js";
import { humanEscalationGraph } from "../utilAgents/humanEscalationAgent/graph.js";

const builder = new StateGraph(MainStateZod)
  .addNode("prepareHold", prepareHold)
  .addNode("sendHold", sendMessageGraph)
  .addNode("validate", validationGraph)
  .addNode("sendVerdict", sendMessageGraph)
  .addNode("askConfirmation", askConfirmation)
  .addNode("sendConfirmation", sendMessageGraph)
  .addNode("awaitConfirmation", awaitConfirmation)
  .addNode("remediate", remediationGraph)
  .addNode("escalate", humanEscalationGraph)

  .addEdge(START, "prepareHold")
  .addEdge("prepareHold", "sendHold")
  .addEdge("sendHold", "validate")
  .addEdge("validate", "sendVerdict")
  .addConditionalEdges("sendVerdict", routeAfterVerdict, {
    human: "escalate",
    confirm: "askConfirmation",
  })
  .addEdge("askConfirmation", "sendConfirmation")
  .addEdge("sendConfirmation", "awaitConfirmation")
  .addConditionalEdges("awaitConfirmation", routeOnConfirmation, {
    yes: "remediate",
    no: "escalate",
  })
  .addEdge("remediate", END)
  .addEdge("escalate", END);

export const complaintGraph = builder.compile();
