import { describe, expect, it } from "vitest";
import { paymentHelpSchema } from "@/lib/payment-help.functions";
describe("payment help input", () => {
  it("rejects descriptions shorter than 10 characters", () => { expect(paymentHelpSchema.safeParse({ description: "no pin" }).success).toBe(false); });
  it("rejects descriptions longer than 1500 characters", () => { expect(paymentHelpSchema.safeParse({ description: "a".repeat(1501) }).success).toBe(false); });
  it("accepts a normal description", () => { expect(paymentHelpSchema.safeParse({ description: "MTN prompt never showed" }).success).toBe(true); });
});
