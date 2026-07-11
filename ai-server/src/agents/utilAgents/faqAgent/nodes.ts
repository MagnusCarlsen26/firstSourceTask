import { retrieveFaq } from "@/db/faqRetriever";

export async function runFaqAgent(request: string): Promise<string> {
  const hits = await retrieveFaq(request);

  return hits.map((h) => `Q: ${h.question}\nA: ${h.answer}`).join("\n\n");
}
