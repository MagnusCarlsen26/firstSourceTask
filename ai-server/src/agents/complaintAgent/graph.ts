import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../shared/schema.js";
import { handleComplaint } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("handleComplaint", handleComplaint)
  .addEdge(START, "handleComplaint")
  .addEdge("handleComplaint", END);

export const complaintGraph = builder.compile();
