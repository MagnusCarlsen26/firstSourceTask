import { StateGraph, START, END } from "@langchain/langgraph";
import { intentGraph } from "../intentClassifierAgent/graph.js";
import { MainStateZod } from "../shared/schema.js";
import { isReliableClassification } from "./router/isReliableIntent.js";
import { routeOnReliability } from "./router/routeOnReliability.js";
import { awaitUserReply } from "./nodes/awaitUserReply.js";
import { sendMessageGraph } from "../utilAgents/sendMessageToUser/graph.js";
import { checkpointer } from "@/persistence/checkpointer";

const builder = new StateGraph(MainStateZod)
  .addNode("intentClassifier", intentGraph)
  .addNode("isReliable", isReliableClassification)
  .addNode("sendClarification", sendMessageGraph)
  .addNode("awaitReply", awaitUserReply)
  .addNode("sendFinal", sendMessageGraph)
  
  .addEdge(START, "intentClassifier")
  .addEdge("intentClassifier", "isReliable")
  .addConditionalEdges("isReliable", routeOnReliability, {
    clarify: "sendClarification",
    exhausted: "sendFinal",
    [END]: END,
  })

  .addEdge("sendClarification", "awaitReply")
  .addEdge("awaitReply", "intentClassifier")

  .addEdge("sendFinal", END);

export const mainGraph = builder.compile({ checkpointer });
