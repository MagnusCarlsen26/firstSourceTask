import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { runMockTool } from "./mock.js";

export const issueRefund = tool(
  async (args) => runMockTool("issueRefund", args),
  {
    name: "issueRefund",
    description:
      "Refund money to the customer's original payment method for an order, " +
      "either in full or a partial amount.",
    schema: z.object({
      orderId: z.string().describe("The order to refund, e.g. ORD-778812."),
      amount: z.number().describe("Refund amount in rupees."),
      reason: z.string().describe("Short reason for the refund."),
    }),
  },
);
