import { openAIClient } from "@/llm/openai";
import { MainState } from "@/agents/shared/schema";
import { runFaqAgent } from "../faqAgent/nodes.js";
import { runUserInfoFetcher } from "../userInfoFetcher/nodes.js";
import { SYSTEM_PROMPT } from "./prompt.js";
import { VerdictZod, Verdict } from "./schema.js";

export async function gatherEvidence(
  state: Pick<MainState, "complaint">,
): Promise<Partial<MainState>> {
  const validation = state.complaint.validation!;
  const { faq, userInfo } = validation;

  const [faqResult, userInfoResult] = await Promise.all([
    faq?.needed ? runFaqAgent(faq.request) : Promise.resolve(undefined),
    userInfo?.needed
      ? runUserInfoFetcher(userInfo.request)
      : Promise.resolve(undefined),
  ]);

  return {
    complaint: {
      validation: {
        ...validation,
        ...(faq && { faq: { ...faq, result: faqResult } }),
        ...(userInfo && { userInfo: { ...userInfo, result: userInfoResult } }),
      },
    },
  };
}

export async function decideVerdict(
  state: Pick<MainState, "complaint" | "util">,
): Promise<Partial<MainState>> {
  const validation = state.complaint.validation!;
  const { request, faq, userInfo } = validation;

  const evidence = [
    faq?.result && `Applicable policy (FAQ):\n${faq.result}`,
    userInfo?.result && `Customer data (dot-path: value):\n${userInfo.result}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const structuredLlm = openAIClient.withStructuredOutput(VerdictZod);
  const verdict = await structuredLlm.invoke([
    ["system", SYSTEM_PROMPT],
    [
      "human",
      `Customer request: ${request}\n\nEvidence:\n${evidence || "(none gathered)"}`,
    ],
  ]);

  return {
    complaint: { validation: { ...validation, verdict } },
    util: { ...state.util, nextMessage: composeVerdictMessage(verdict) },
  };
}

function composeVerdictMessage(verdict: Verdict): string {
  const openings: Record<Verdict["eligibility"], string> = {
    FULLY_ELIGIBLE:
      "Thank you for your patience. We have reviewed your request and are pleased to confirm that you are eligible.",
    PARTIALLY_ELIGIBLE:
      "Thank you for your patience. We have reviewed your request and are able to offer a partial resolution.",
    NOT_ELIGIBLE:
      "Thank you for your patience. We have carefully reviewed your request, and unfortunately it does not meet the criteria on this occasion.",
    NEEDS_HUMAN:
      "Thank you for your patience. Your request requires a closer look, so we are connecting you with a support specialist who will assist you further.",
  };

  return `${openings[verdict.eligibility]} ${verdict.reason} ${verdict.customerAction}`.trim();
}
