import { StateGraph, START, END } from "@langchain/langgraph";
import { MainStateZod } from "../shared/schema.js";
import { planQuery } from "./planner/nodes.js";
import { handleFaq } from "./faqAgent/nodes.js";
import { handleUserInfo } from "./userInfoFetcherAgent/nodes.js";
import { composeAnswer } from "./nodes.js";
import { routeAfterPlan } from "./router/routeOnPlan.js";
import { sendMessageGraph } from "../utilAgents/sendMessageToUser/graph.js";

const builder = new StateGraph(MainStateZod)
  .addNode("plan", planQuery)
  .addNode("faq", handleFaq)
  .addNode("userInfo", handleUserInfo)
  .addNode("compose", composeAnswer)
  .addNode("send", sendMessageGraph)

  .addEdge(START, "plan")
  .addConditionalEdges("plan", routeAfterPlan, {
    faq: "faq",
    userInfo: "userInfo",
    compose: "compose",
  })
  .addEdge("faq", "compose")
  .addEdge("userInfo", "compose")
  .addEdge("compose", "send")
  .addEdge("send", END);

export const queryGraph = builder.compile();
