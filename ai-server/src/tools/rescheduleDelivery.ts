import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { runMockTool } from "./mock.js";

export const rescheduleDelivery = tool(
  async (args) => runMockTool("rescheduleDelivery", args),
  {
    name: "rescheduleDelivery",
    description:
      "Re-dispatch or reschedule delivery of an order, e.g. when it was delayed " +
      "or delivered to the wrong place.",
    schema: z.object({
      orderId: z.string().describe("The order to redeliver, e.g. ORD-778812."),
      note: z.string().describe("Instruction for the delivery team."),
    }),
  },
);
