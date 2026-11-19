import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";
export const PAYMENT_HELP_MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You help buyers of GEMON online courses in Ghana who had a problem paying.
Facts: payments go through Paystack in GHS using MTN MoMo, Telecel Cash, AirtelTigo Money or card. Course 1 costs GHC 1, other courses GHC 50, all 10 courses GHC 300.
After entering a mobile money number, the buyer's network sends a PIN prompt to their phone; the website never asks for a PIN. Course access only unlocks after Paystack confirms the payment.
Common causes: low balance, daily/transaction limits, unregistered or wrong-network number, pending approvals (MTN: *170# > My Wallet > My Approvals), prompt expired, wallet not allowed to pay merchants, phone off or no signal, card declined by bank.
Reply in the buyer's language in plain words, under 180 words, as plain text without markdown or asterisks, with: "Likely cause:" (1-2 sentences) and "What to do:" (3-5 numbered steps). Never ask for or repeat PINs, card numbers or OTPs. If money was deducted but no access, tell them to keep the reference and contact GEMON on WhatsApp. Do not promise refunds.`;

export async function explainPaymentProblem(description: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Payment help is not set up yet. Please contact GEMON on WhatsApp.");
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID_HEADER, runId);
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(PAYMENT_HELP_MODEL),
    maxRetries: 0,
    instructions: INSTRUCTIONS,
    messages: [{ role: "user", content: description }],
    onError: ({ error }) => { failure = error; },
    providerOptions: {
      openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
    },
  });
  let text = "";
  try { text = (await result.text).trim(); } catch (error) { failure ??= error; }
  if (failure || !text) {
    const status = (failure as { statusCode?: number } | undefined)?.statusCode;
    console.error("payment help AI error", status, failure);
    if (status === 429) throw new Error("Payment help is busy right now. Please try again in a minute.");
    if (status === 402 || status === 403) throw new Error("Payment help is temporarily unavailable. Please contact GEMON on WhatsApp.");
    throw new Error("We couldn't get an explanation right now. Please try again, or contact GEMON on WhatsApp.");
  }
  return text;
}
