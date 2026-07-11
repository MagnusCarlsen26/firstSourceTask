import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "@/agents/shared/schema";
import { escalateToHuman } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("escalateToHuman", escalateToHuman)
  .addEdge(START, "escalateToHuman")
  .addEdge("escalateToHuman", END);

export const humanEscalationGraph = builder.compile();
