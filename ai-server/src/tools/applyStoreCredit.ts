import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { runMockTool } from "./mock.js";

export const applyStoreCredit = tool(
  async (args) => runMockTool("applyStoreCredit", args),
  {
    name: "applyStoreCredit",
    description:
      "Credit the customer's Swiggy wallet with store credit, typically as a " +
      "goodwill gesture or partial compensation.",
    schema: z.object({
      customerId: z.string().describe("The customer to credit, e.g. USR-100482."),
      amount: z.number().describe("Store credit amount in rupees."),
      reason: z.string().describe("Short reason for the credit."),
    }),
  },
);
