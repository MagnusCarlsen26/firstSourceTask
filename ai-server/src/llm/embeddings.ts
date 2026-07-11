import { OpenAIEmbeddings } from "@langchain/openai";
import { OPENAI_API_KEY } from "../config/creds.js";

export const embeddingsClient = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
  model: "text-embedding-3-small",
});
