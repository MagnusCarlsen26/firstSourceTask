import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { runMockTool } from "./mock.js";

export const cancelOrder = tool(
  async (args) => runMockTool("cancelOrder", args),
  {
    name: "cancelOrder",
    description:
      "Cancel an order that has not yet been delivered. Use when the customer " +
      "is eligible to have the order stopped.",
    schema: z.object({
      orderId: z.string().describe("The order to cancel, e.g. ORD-778812."),
      reason: z.string().describe("Short reason for the cancellation."),
    }),
  },
);
