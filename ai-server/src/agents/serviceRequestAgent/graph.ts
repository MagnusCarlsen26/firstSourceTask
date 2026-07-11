import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../shared/schema.js";
import { handleServiceRequest } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("handleServiceRequest", handleServiceRequest)
  .addEdge(START, "handleServiceRequest")
  .addEdge("handleServiceRequest", END);

export const serviceRequestGraph = builder.compile();
