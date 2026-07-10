import { ChatOpenAI } from "@langchain/openai";
import { OPENAI_API_KEY } from "../config/creds.js";

// TODO: Make the parameters configurable
export const openAIClient = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  model: "gpt-5-mini",
});
