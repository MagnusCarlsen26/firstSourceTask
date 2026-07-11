import { MainState } from "../../shared/schema.js";
import { retrieveFaq } from "../../../db/faqRetriever.js";

export async function handleFaq(
  state: Pick<MainState, "query">,
): Promise<Partial<MainState>> {
  const faq = state.query.faq!;

  const hits = await retrieveFaq(faq.request);
  const result = hits
    .map((h) => `Q: ${h.question}\nA: ${h.answer}`)
    .join("\n\n");

  return {
    query: { faq: { ...faq, result } },
  };
}
