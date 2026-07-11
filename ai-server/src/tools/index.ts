import type { StructuredToolInterface } from "@langchain/core/tools";
import { issueRefund } from "./issueRefund.js";
import { cancelOrder } from "./cancelOrder.js";
import { replaceMissingItem } from "./replaceMissingItem.js";
import { applyStoreCredit } from "./applyStoreCredit.js";
import { rescheduleDelivery } from "./rescheduleDelivery.js";

export const tools: StructuredToolInterface[] = [
  issueRefund,
  cancelOrder,
  replaceMissingItem,
  applyStoreCredit,
  rescheduleDelivery,
];

export const toolsByName: Record<string, StructuredToolInterface> =
  Object.fromEntries(tools.map((t) => [t.name, t]));
