import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../shared/schema.js";
import { prepareHold } from "./nodes.js";
import { sendMessageGraph } from "../utilAgents/sendMessageToUser/graph.js";
import { validationGraph } from "../utilAgents/validationAgent/graph.js";

const builder = new StateGraph(MainStateZod)
  .addNode("prepareHold", prepareHold)
  .addNode("sendHold", sendMessageGraph)
  .addNode("validate", validationGraph)
  .addNode("sendVerdict", sendMessageGraph)

  .addEdge(START, "prepareHold")
  .addEdge("prepareHold", "sendHold")
  .addEdge("sendHold", "validate")
  .addEdge("validate", "sendVerdict")
  .addEdge("sendVerdict", END);

export const complaintGraph = builder.compile();
