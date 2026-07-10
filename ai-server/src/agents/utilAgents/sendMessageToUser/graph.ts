import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../../shared/schema.js";
import { sendMessage } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("sendMessage", sendMessage)
  .addEdge(START, "sendMessage")
  .addEdge("sendMessage", END);

export const sendMessageGraph = builder.compile();
