import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const paymentHelpSchema = z.object({ description: z.string().trim().min(10, "Please describe the problem in a few more words.").max(1500) }).strict();

export const explainPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => paymentHelpSchema.parse(data))
  .handler(async ({ data }) => {
    const { explainPaymentProblem } = await import("./payment-help.server");
    return { answer: await explainPaymentProblem(data.description) };
  });
