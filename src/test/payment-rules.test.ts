import { describe, expect, it } from "vitest";
import { checkoutSchema, paymentSelection, providerSchema, verifiedPayment } from "@/lib/payment-rules";
describe("Paystack rules", () => {
  it("charges GHC 50 for every single course", () => { for (let i = 1; i <= 10; i++) expect(paymentSelection(String(i)).amount).toBe(5000); });
  it("charges GHC 300 for the ten-course bundle", () => { expect(paymentSelection("all").amount).toBe(30000); expect(paymentSelection("all").courses).toHaveLength(10); });
  it("rejects buyer-supplied prices", () => { expect(checkoutSchema.safeParse({ selection: "1", email: "buyer@example.com", phone: "0241234567", provider: "mtn", amount: 1 }).success).toBe(false); });
  it("supports MTN, Telecel and AirtelTigo", () => { for (const provider of ["mtn", "vod", "atl"]) expect(providerSchema.safeParse(provider).success).toBe(true); expect(providerSchema.safeParse("other").success).toBe(false); });
  it("grants access only to an exact successful payment", () => {
    const order = { reference: "gemon_order", amount: 5000, currency: "GHS", email: "buyer@example.com" };
    const tx = { ...order, status: "success", customer: { email: order.email } };
    expect(verifiedPayment(order, tx)).toBe(true);
    for (const change of [{ status: "pending" }, { status: "failed" }, { reference: "another" }, { amount: 100 }, { currency: "USD" }, { customer: { email: "other@example.com" } }]) expect(verifiedPayment(order, { ...tx, ...change })).toBe(false);
  });
});