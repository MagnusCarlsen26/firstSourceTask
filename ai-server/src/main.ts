import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Command } from "@langchain/langgraph";
import { mainGraph } from "./agents/mainAgent/graph.js";
import type { MainState } from "./agents/shared/schema.js";

// TODO: This file got slightly messy. clean it up later.

// Result shape when the graph pauses on an interrupt().
type InvokeResult = MainState & { __interrupt__?: unknown };

function lastSystemMessage(state: MainState): string | undefined {
  for (let i = state.chatHistory.length - 1; i >= 0; i--) {
    const entry = state.chatHistory[i];
    if (entry?.author === "system") return entry.message;
  }
  return undefined;
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  const config = { configurable: { thread_id: randomUUID() } };

  let result = (await mainGraph.invoke(
    {
      chatHistory: [{ author: "user", message: "Am I elibigle for a refund for this order?" }],
    },
    config,
  )) as InvokeResult;

  while (result.__interrupt__) {
    const question = lastSystemMessage(result) ?? "(waiting for your reply)";
    console.log(`\nAssistant: ${question}`);

    const reply = await rl.question("You: ");
    result = (await mainGraph.invoke(
      new Command({ resume: reply }),
      config,
    )) as InvokeResult;
  }

  const closing = lastSystemMessage(result);
  if (closing) console.log(`\nAssistant: ${closing}`);

  console.log("\nFinal intent:", result.intent);
  rl.close();
}

main();
