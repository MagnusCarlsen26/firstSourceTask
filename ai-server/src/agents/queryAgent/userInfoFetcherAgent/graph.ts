import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../../shared/schema.js";
import { handleUserInfo } from "./nodes.js";

const builder = new StateGraph(MainStateZod)
  .addNode("handleUserInfo", handleUserInfo)
  .addEdge(START, "handleUserInfo")
  .addEdge("handleUserInfo", END);

export const userInfoGraph = builder.compile();
