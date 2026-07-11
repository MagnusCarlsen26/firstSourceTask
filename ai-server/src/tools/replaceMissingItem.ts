import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { runMockTool } from "./mock.js";

export const replaceMissingItem = tool(
  async (args) => runMockTool("replaceMissingItem", args),
  {
    name: "replaceMissingItem",
    description:
      "Dispatch a replacement for an item that was missing or incorrect in an " +
      "order.",
    schema: z.object({
      orderId: z.string().describe("The order containing the item, e.g. ORD-778812."),
      itemName: z.string().describe("The item to replace."),
      reason: z.string().describe("Short reason for the replacement."),
    }),
  },
);
