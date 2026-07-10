import { mainGraph } from "./agents/mainAgent/graph.js";

async function main() {
  const result = await mainGraph.invoke({
    chatHistory: [
      {
        author: "user",
        message: "Why is my order fucking late.",
      },
    ],
  });

  console.log(result);
}

main();
