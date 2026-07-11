import { MainState } from "../../shared/schema.js";


export async function handleFaq(
  state: Pick<MainState, "query">,
): Promise<Partial<MainState>> {
  const faq = state.query.faq!;

  // TODO: retrieve from the knowledge base using `faq.request`.
  const result = `[FAQ dummy answer] for request: "${faq.request}"`;

  return {
    query: { faq: { ...faq, result } },
  };
}
