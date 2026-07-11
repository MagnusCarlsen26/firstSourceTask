import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { embeddingsClient } from "../llm/embeddings.js";
import { faqEntries, FaqEntry } from "./faq.js";

// On-disk HNSW index. Built once from faq.json and persisted here; subsequent
// runs load it from disk instead of re-embedding.
const INDEX_DIR = fileURLToPath(new URL("./faqIndex", import.meta.url));

let storePromise: Promise<HNSWLib> | null = null;

async function buildStore(): Promise<HNSWLib> {
  if (existsSync(INDEX_DIR)) {
    return HNSWLib.load(INDEX_DIR, embeddingsClient);
  }

  const texts = faqEntries.map((e) => `${e.question}\n${e.answer}`);
  const metadatas = faqEntries.map((e) => ({ ...e }));
  const store = await HNSWLib.fromTexts(texts, metadatas, embeddingsClient);
  await store.save(INDEX_DIR);
  return store;
}

export async function retrieveFaq(query: string, k = 4): Promise<FaqEntry[]> {
  storePromise ??= buildStore();
  const store = await storePromise;

  const results = await store.similaritySearch(query, k);
  return results.map((doc) => doc.metadata as FaqEntry);
}
