import { webcrypto } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ token: "browser-capability" as string | undefined, orders: [] as Record<string, unknown>[], writes: [] as Record<string, unknown>[], transaction: {} as Record<string, unknown> }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({ inputValidator(validate: (data: unknown) => unknown) { return { handler: (handler: (input: { data: unknown }) => unknown) => (input: { data: unknown }) => handler({ data: validate(input.data) }) }; } }) }));
vi.mock("@tanstack/react-start/server", () => ({ getCookie: () => state.token, setCookie: vi.fn(), getRequest: () => ({ url: "https://gemon.example" }), setResponseHeader: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: () => {
  let updating = false;
  const filters: [string, unknown][] = [];
  const rows = () => state.orders.filter(row => filters.every(([key, value]) => row[key] === value));
  const query = {
    select: () => query,
    insert: async (value: Record<string, unknown>) => { state.orders.push(value); return { error: null }; },
    eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
    in: () => query,
    order: () => query,
    update: (value: Record<string, unknown>) => { updating = true; state.writes.push(value); return query; },
    maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: updating ? null : rows(), error: null }).then(resolve),
  };
  return query;
} } }));

import { beginPayment, initializeHostedPayment, checkPayment, getPurchaseState } from "@/lib/paystack.functions";

const reference = "gemon_0123456789abcdef0123456789abcdef";
beforeEach(async () => {
  vi.stubGlobal("crypto", webcrypto);
  state.token = "browser-capability"; state.writes = [];
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(state.token));
  const hash = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
  state.orders = [{ reference, amount: 5000, currency: "GHS", email: "buyer@example.com", status: "pending", course_selection: "1", checkout_token_hash: hash }];
  state.transaction = { reference, amount: 5000, currency: "GHS", status: "success", customer: { email: "buyer@example.com" } };
  vi.stubEnv("PAYSTACK_SECRET_KEY", "unit-test-only");
  vi.stubEnv("PAYSTACK_PUBLIC_KEY", "pk_test_unitTestOnly");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ status: true, data: state.transaction }), { status: 200 })));
});

describe("server payment and access flow", () => {
  it.each([["1", 5000], ["all", 30000]] as const)("initializes email-first %s at %i pesewas with card and mobile money", async (selection, amount) => {
    state.token = "01234567-89ab-cdef-0123-456789abcdef";
    state.orders = [];
    vi.mocked(fetch).mockImplementation(async (url, options) => {
      expect(url).toBe("https://api.paystack.co/transaction/initialize");
      const body = JSON.parse(String(options?.body));
      expect(body).toMatchObject({ email: "buyer@example.com", currency: "GHS", amount, channels: ["mobile_money", "card"] });
      expect(body.reference).toMatch(/^gemon_[a-f0-9]{32}$/);
      return new Response(JSON.stringify({ status: true, data: { reference: body.reference, access_code: "unit-access" } }));
    });
    const result = await initializeHostedPayment({ data: { selection, email: "buyer@example.com" } });
    expect(result.accessCode).toBe("unit-access");
    expect(state.orders[0]).toMatchObject({ amount, provider: "paystack", email: "buyer@example.com" });
    expect(state.writes).toEqual([]);
  });
  it("rejects an email-first buyer-supplied amount", async () => {
    await expect(initializeHostedPayment({ data: { selection: "all", email: "buyer@example.com", amount: 1 } as never })).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("generates different references for independent purchases", async () => {
    state.token = "01234567-89ab-cdef-0123-456789abcdef"; state.orders = [];
    vi.mocked(fetch).mockImplementation(async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      return new Response(JSON.stringify({ status: true, data: { reference: body.reference, access_code: "unit-access" } }));
    });
    const one = await initializeHostedPayment({ data: { selection: "1", email: "buyer@example.com" } });
    const two = await initializeHostedPayment({ data: { selection: "2", email: "buyer@example.com" } });
    expect(one.reference).not.toBe(two.reference);
  });
  it.each(["mtn", "vod", "atl"] as const)("requests the GHC 50 wallet prompt using %s and a normalized phone", async provider => {
    state.token = "01234567-89ab-cdef-0123-456789abcdef";
    vi.mocked(fetch).mockImplementation(async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      expect(body.amount).toBe(5000);
      expect(body.mobile_money).toEqual({ phone: "0241234567", provider });
      return new Response(JSON.stringify({ status: true, data: { reference: body.reference, status: "send_otp", display_text: "Enter your one-time code" } }));
    });
    const result = await beginPayment({ data: { selection: "1", email: "buyer@example.com", phone: "+233241234567", provider } });
    expect(result.status).toBe("send_otp");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("initializes the full bundle at exactly GHC 300", async () => {
    state.token = "01234567-89ab-cdef-0123-456789abcdef";
    vi.mocked(fetch).mockImplementation(async (_url, options) => {
      const body = JSON.parse(String(options?.body));
      expect(body.amount).toBe(30000);
      return new Response(JSON.stringify({ status: true, data: { reference: body.reference, status: "pay_offline" } }));
    });
    expect((await beginPayment({ data: { selection: "all", email: "buyer@example.com", phone: "0241234567", provider: "mtn" } })).status).toBe("pending");
  });
  it("keeps an uncertain wallet request pending without initializing a second charge", async () => {
    state.token = "01234567-89ab-cdef-0123-456789abcdef";
    vi.mocked(fetch).mockRejectedValue(new Error("Timed out"));
    const result = await beginPayment({ data: { selection: "1", email: "buyer@example.com", phone: "0241234567", provider: "mtn" } });
    expect(result.status).toBe("pending");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(state.writes).toEqual([]);
  });
  it("persists a verified GHC 50 purchase and returns only the selected course", async () => {
    const result = await checkPayment({ data: { reference } });
    expect(result.status).toBe("paid"); expect(result.courses.map(c => c.id)).toEqual(["1"]);
    expect(state.writes[0]).toMatchObject({ status: "paid" });
    expect(state.writes[0]?.['verified_at']).toEqual(expect.any(String));
  });
  it("returns all ten courses only after a GHC 300 bundle verifies", async () => {
    state.orders[0] = { ...state.orders[0], amount: 30000, course_selection: "all" };
    state.transaction['amount'] = 30000;
    const result = await checkPayment({ data: { reference } });
    expect(result.status).toBe("paid"); expect(result.courses.map(c => c.id)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  });
  it("never grants access for a lower buyer-paid amount", async () => {
    state.transaction['amount'] = 1;
    const result = await checkPayment({ data: { reference } });
    expect(result.courses).toEqual([]); expect(state.writes).toEqual([]);
  });
  it("denies access to a reference from another browser", async () => {
    state.token = "different-browser";
    await expect(checkPayment({ data: { reference } })).rejects.toThrow("Payment not found for this browser.");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rechecks saved paid purchases rather than trusting saved status", async () => {
    state.orders[0] = { ...state.orders[0], status: "paid" };
    expect((await getPurchaseState({ data: { selection: "1" } })).courses.map(c => c.id)).toEqual(["1"]);
    state.transaction['status'] = "reversed";
    expect((await getPurchaseState({ data: { selection: "1" } })).courses).toEqual([]);
  });
  it("does not grant access during provider outages", async () => {
    state.orders[0] = { ...state.orders[0], status: "paid" };
    vi.mocked(fetch).mockRejectedValue(new Error("Provider unavailable"));
    const result = await getPurchaseState({ data: { selection: "1" } });
    expect(result.courses).toEqual([]); expect(result.unavailable).toBe(true);
  });
  it("an absent browser capability exposes no orders", async () => {
    state.token = undefined;
    expect((await getPurchaseState({ data: { selection: "1" } })).courses).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});