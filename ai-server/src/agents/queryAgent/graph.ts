import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../shared/schema.js";
import { handleQuery } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("handleQuery", handleQuery)
  .addEdge(START, "handleQuery")
  .addEdge("handleQuery", END);

export const queryGraph = builder.compile();
