import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../../shared/schema.js";
import { handleFaq } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("handleFaq", handleFaq)
  .addEdge(START, "handleFaq")
  .addEdge("handleFaq", END);

export const faqGraph = builder.compile();
