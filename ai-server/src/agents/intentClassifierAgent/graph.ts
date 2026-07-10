import { StateGraph, START, END } from "@langchain/langgraph";
import { classifyNode } from "./nodes.js";
import { MainStateZod } from "../shared/schema.js";

const builder = new StateGraph(MainStateZod)
  .addNode("classify", classifyNode)
  
  .addEdge(START, "classify")
  .addEdge("classify", END);

export const intentGraph = builder.compile();
