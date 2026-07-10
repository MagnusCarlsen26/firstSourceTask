import { StateGraph, START, END } from "@langchain/langgraph";
import { intentGraph } from "../intentClassifierAgent/graph.js";
import { MainStateZod } from "../shared/schema.js";

const builder = new StateGraph(MainStateZod)
  .addNode("intentClassifier", intentGraph)
  
  .addEdge(START, "intentClassifier")
  .addEdge("intentClassifier", END);

export const mainGraph = builder.compile();
