import { StateGraph, START, END } from "@langchain/langgraph";
import { intentGraph } from "../intentClassifierAgent/graph.js";
import { MainStateZod } from "../shared/schema.js";
import { isReliableClassification } from "./router/isReliableIntent.js";
import { routeOnReliability } from "./router/routeOnReliability.js";
import { awaitUserReply } from "./nodes/awaitUserReply.js";
import { sendMessageGraph } from "../utilAgents/sendMessageToUser/graph.js";
import { queryGraph } from "../queryAgent/graph.js";
import { complaintGraph } from "../complaintAgent/graph.js";
import { checkpointer } from "@/persistence/checkpointer";

const builder = new StateGraph(MainStateZod)
  .addNode("intentClassifier", intentGraph)
  .addNode("isReliable", isReliableClassification)
  .addNode("sendClarification", sendMessageGraph)
  .addNode("awaitReply", awaitUserReply)
  .addNode("sendFinal", sendMessageGraph) // TODO: This node is to send final message that we didn't understand your request. In future escalate this to human
  .addNode("queryAgent", queryGraph)
  .addNode("sendQueryAnswer", sendMessageGraph)
  .addNode("complaintAgent", complaintGraph)

  .addEdge(START, "intentClassifier")
  .addEdge("intentClassifier", "isReliable")
  .addConditionalEdges("isReliable", routeOnReliability, {
    query: "queryAgent",
    complaint: "complaintAgent",
    clarify: "sendClarification",
    exhausted: "sendFinal",
    [END]: END,
  })

  .addEdge("sendClarification", "awaitReply")
  .addEdge("awaitReply", "intentClassifier")

  .addEdge("queryAgent", "sendQueryAnswer")
  .addEdge("sendQueryAnswer", END)
  .addEdge("complaintAgent", END)
  .addEdge("sendFinal", END);

export const mainGraph = builder.compile({ checkpointer });
