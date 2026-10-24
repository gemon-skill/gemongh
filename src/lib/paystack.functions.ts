import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { checkoutSchema, localGhanaPhone, paymentSelection, referenceSchema, verifiedPayment } from "./payment-rules";

const cookieName = "gemon_checkout";
async function tokenHash(token: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function paystack(path: string, key: string, body?: unknown) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(25000),
  });
  const result = await response.json().catch(() => ({})) as { status?: boolean; message?: string; data?: { message?: string; gateway_response?: string } };
  if (!response.ok || !result.status) {
    const detail = result.data?.gateway_response ?? result.data?.message ?? result.message;
    console.error("Paystack request failed", path, response.status, detail);
    throw new Error(detail ? `Paystack: ${detail}` : "Paystack could not process this request. Check your wallet details and try again.");
  }
  return result.data;
}
const chargeResponse = z.object({ reference: referenceSchema, status: z.string(), display_text: z.string().optional(), gateway_response: z.string().optional(), message: z.string().optional() });

export const beginPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const key = process.env['PAYSTACK_SECRET_KEY'];
    if (!key) throw new Error("Payments are not available yet. Please contact GEMON.");
    const selected = paymentSelection(data.selection);
    const phone = localGhanaPhone(data.phone);
    const token = getCookie(cookieName) ?? crypto.randomUUID();
    if (!/^[a-f0-9-]{36}$/.test(token)) throw new Error("Please clear your checkout cookies and try again.");
    const https = new URL(getRequest().url).protocol === "https:";
    // SameSite=None keeps the capability working when the site is shown inside an embedded preview.
    setCookie(cookieName, token, { httpOnly: true, secure: https, sameSite: https ? "none" : "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    const hash = await tokenHash(token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // This is an intentional guest order. The browser capability, not a user ID or email, authorizes subsequent access.
    async function createOrder() {
      const reference = `gemon_${crypto.randomUUID().replaceAll("-", "")}`;
      const { error } = await supabaseAdmin.from("payment_orders").insert({ reference, checkout_token_hash: hash, course_selection: selected.selection, email: data.email, amount: selected.amount, currency: selected.currency, provider: data.provider });
      if (error) throw new Error("Unable to create your order. Please try again.");
      return reference;
    }
    const metadata = { course_selection: selected.selection, phone, provider: data.provider };

    // 1) Direct mobile money charge: Paystack pushes the PIN prompt straight to the buyer's phone.
    //    The amount comes only from the selected course/bundle on the server.
    const reference = await createOrder();
    let chargeError = "";
    try {
      const charge = chargeResponse.parse(await paystack("/charge", key, { email: data.email, amount: selected.amount, currency: "GHS", reference, mobile_money: { phone, provider: data.provider }, metadata }));
      if (charge.reference !== reference) throw new Error("Unable to confirm this payment request.");
      if (charge.status === "failed") throw new Error(charge.gateway_response ?? charge.message ?? "Your wallet declined the payment.");
      const amountText = `GHC ${selected.amount / 100}`;
      if (charge.status === "send_otp") return { reference, status: "send_otp" as const, message: charge.display_text ?? `Enter the code sent to ${phone} to approve ${amountText}.` };
      if (charge.status === "success") return { reference, status: "verify" as const, message: "Payment approved. Verifying…" };
      return { reference, status: "pending" as const, message: charge.display_text ?? `A prompt for ${amountText} has been sent to ${phone}. Enter your Mobile Money PIN on your phone to approve it.` };
    } catch (e) {
      chargeError = e instanceof Error ? e.message : "";
      await supabaseAdmin.from("payment_orders").update({ status: "failed" }).eq("reference", reference);
    }

    // 2) Fallback: Paystack's secure checkout window (also sends the wallet prompt), same fixed amount.
    const fallback = await createOrder();
    try {
      const init = z.object({ access_code: z.string(), reference: z.string() }).parse(await paystack("/transaction/initialize", key, { reference: fallback, amount: selected.amount, currency: "GHS", email: data.email, channels: ["mobile_money"], metadata }));
      if (init.reference !== fallback) throw new Error("Unable to confirm this payment request.");
      return { reference: fallback, status: "open_checkout" as const, accessCode: init.access_code, message: "Complete the payment in the Paystack window, then approve the prompt on your phone." };
    } catch (e) {
      await supabaseAdmin.from("payment_orders").update({ status: "failed" }).eq("reference", fallback);
      throw new Error(chargeError || (e instanceof Error ? e.message : "Unable to start payment. Please try again."));
    }
  });

export const checkPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ reference: referenceSchema }).strict().parse(data))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const key = process.env['PAYSTACK_SECRET_KEY'];
    if (!key) throw new Error("Payments are not available yet.");
    const token = getCookie(cookieName);
    if (!token) throw new Error("Open this payment in the browser where you started checkout.");
    const hash = await tokenHash(token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("payment_orders").select("reference,amount,currency,email,status,course_selection").eq("reference", data.reference).eq("checkout_token_hash", hash).maybeSingle();
    if (error || !order) throw new Error("Payment not found for this browser.");
    // Always reverify with the provider, including previously paid orders.
    let transaction: unknown;
    try { transaction = await paystack(`/transaction/verify/${encodeURIComponent(order.reference)}`, key); }
    catch { return { status: "pending" as const, courses: [] as { id: string; title: string }[], message: "Payment is not confirmed yet. Please check again shortly." }; }
    if (verifiedPayment(order, transaction)) {
      const { error: saveError } = await supabaseAdmin.from("payment_orders").update({ status: "paid", verified_at: new Date().toISOString() }).eq("reference", order.reference).eq("checkout_token_hash", hash);
      if (saveError) throw new Error("Payment received, but access could not be recorded. Check again; do not pay twice.");
      return { status: "paid" as const, courses: paymentSelection(order.course_selection).courses, message: "Payment verified. Your purchase is confirmed." };
    }
    const status = z.object({ status: z.string() }).safeParse(transaction);
    const failed = status.success && ["failed", "abandoned", "reversed"].includes(status.data.status);
    if (failed) await supabaseAdmin.from("payment_orders").update({ status: "failed" }).eq("reference", order.reference);
    if (!failed) {
      try {
        const charge = chargeResponse.safeParse(await paystack(`/charge/${encodeURIComponent(order.reference)}`, key));
        if (charge.success && charge.data.reference === order.reference && charge.data.status === "send_otp") {
          return { status: "send_otp" as const, courses: [] as { id: string; title: string }[], message: charge.data.display_text ?? "Enter the one-time code sent to your phone." };
        }
      } catch { /* Verification remains the authority; an unavailable challenge is not a payment failure. */ }
    }
    return { status: failed ? "failed" as const : "pending" as const, courses: [] as { id: string; title: string }[], message: failed ? "Payment was not completed. No course access has been granted." : "Awaiting confirmation from your mobile wallet. No access has been granted yet." };
  });

// A guest's unguessable HttpOnly cookie authorizes only their own orders.
// Reverify paid orders before returning any access; never trust a browser success callback.
export const getPurchaseState = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ selection: z.string().optional() }).strict().parse(data))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const token = getCookie(cookieName);
    const empty = { courses: [] as { id: string; title: string }[], pendingReference: null as string | null, unavailable: false };
    if (!token) return empty;
    const hash = await tokenHash(token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: orders, error } = await supabaseAdmin.from("payment_orders")
      .select("reference,amount,currency,email,status,course_selection")
      .eq("checkout_token_hash", hash).in("status", ["paid", "pending"]).order("created_at", { ascending: false });
    if (error) throw new Error("Unable to retrieve your purchases. Please try again.");
    const pendingReference = orders?.find(order => order.status === "pending" && order.course_selection === data.selection)?.reference ?? null;
    const key = process.env['PAYSTACK_SECRET_KEY'];
    if (!key) return { ...empty, pendingReference, unavailable: true };
    const courses = new Map<string, { id: string; title: string }>();
    let unavailable = false;
    for (const order of orders ?? []) {
      if (order.status !== "paid") continue;
      try {
        const tx = await paystack(`/transaction/verify/${encodeURIComponent(order.reference)}`, key);
        if (verifiedPayment(order, tx)) {
          for (const course of paymentSelection(order.course_selection).courses) courses.set(course.id, course);
        }
      } catch { unavailable = true; }
    }
    return { courses: [...courses.values()], pendingReference, unavailable };
  });

export const submitPaymentOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ reference: referenceSchema, otp: z.string().regex(/^[0-9]{4,10}$/) }).strict().parse(data))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const token = getCookie(cookieName);
    const key = process.env['PAYSTACK_SECRET_KEY'];
    if (!token || !key) throw new Error("Open checkout in the browser where you started payment.");
    const hash = await tokenHash(token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("payment_orders").select("reference,status").eq("reference", data.reference).eq("checkout_token_hash", hash).maybeSingle();
    if (error || !order || order.status !== "pending") throw new Error("No pending payment was found for this browser.");
    const result = chargeResponse.parse(await paystack("/charge/submit_otp", key, { reference: order.reference, otp: data.otp }));
    if (result.reference !== order.reference) throw new Error("Unable to confirm this payment request.");
    return { status: result.status, message: result.display_text ?? "Code submitted. Check your payment status." };
  });