import { TOOL_SUCCESS_RATE } from "@/config/config";

// Simulates calling an external system. Succeeds with probability
// TOOL_SUCCESS_RATE; throwing on failure so callers can treat it like a real
// tool that errors out.
export function runMockTool(name: string, args: Record<string, unknown>): string {
  if (Math.random() >= TOOL_SUCCESS_RATE) {
    throw new Error(`Tool "${name}" failed`);
  }

  return `${name} completed successfully with ${JSON.stringify(args)}`;
}
