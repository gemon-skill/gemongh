import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Smartphone, LockKeyhole, ShieldCheck, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { getCourse, PRICE_GHS, BUNDLE_GHS } from "@/lib/courses";
import { beginPayment, checkPayment, getPurchaseState, submitPaymentOtp } from "@/lib/paystack.functions";
import { Button } from "@/components/ui/button";
import { PurchaseAccess } from "@/components/purchase-access";

export const Route = createFileRoute("/checkout/$id")({
  loader: ({ params }) => {
    const course = getCourse(params.id);
    if (params.id !== "all" && !course) throw notFound();
    return { selection: params.id, course, title: params.id === "all" ? "All 10 courses bundle" : course?.title ?? "Course", price: params.id === "all" ? BUNDLE_GHS : PRICE_GHS };
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Checkout"} · Paystack checkout — GEMON` },
    { name: "description", content: "Secure fixed-price course payments with MTN, Telecel or AirtelTigo through Paystack." },
    { property: "og:title", content: "GEMON · Paystack course checkout" },
    { property: "og:description", content: "Pay for your selected course or ten-course bundle with Ghana mobile money." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: Checkout,
});

const input = "w-full rounded-md border border-input bg-background px-4 py-3 outline-none focus:border-primary";
const providers = [{ id: "mtn", name: "MTN", wallet: "MoMo" }, { id: "vod", name: "Telecel", wallet: "Cash" }, { id: "atl", name: "AirtelTigo", wallet: "Money" }] as const;
type PaystackPopCtor = new () => { resumeTransaction: (code: string, cb: { onSuccess: () => void; onCancel: () => void }) => void };
function loadPaystack(): Promise<PaystackPopCtor> {
  const w = window as unknown as { PaystackPop?: PaystackPopCtor };
  if (w.PaystackPop) return Promise.resolve(w.PaystackPop);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v2/inline.js";
    s.onload = () => w.PaystackPop ? resolve(w.PaystackPop) : reject(new Error("Paystack failed to load"));
    s.onerror = () => reject(new Error("Paystack could not load. Check your connection and try again."));
    document.head.appendChild(s);
  });
}

function Checkout() {
  const { selection, course, title, price } = Route.useLoaderData();
  const begin = useServerFn(beginPayment);
  const verify = useServerFn(checkPayment);
  const restore = useServerFn(getPurchaseState);
  const sendOtp = useServerFn(submitPaymentOtp);
  const [provider, setProvider] = useState<"mtn" | "vod" | "atl">("mtn");
  const [reference, setReference] = useState<string | null>(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const inFlight = useRef(false);
  const owned = selection === "all" ? courses.length === 10 : courses.some(c => c.id === selection);

  useEffect(() => {
    let active = true;
    setRestoring(true); setReference(null); setCourses([]); setStatus("idle"); setError(""); setMessage("");
    restore({ data: { selection } }).then(result => {
      if (!active) return;
      setCourses(result.courses);
      if (result.pendingReference) { setReference(result.pendingReference); setStatus("pending"); setMessage("An earlier payment is awaiting confirmation. Check its status before paying again."); }
      if (result.unavailable) setError("Purchase verification is temporarily unavailable. Please try again before making another payment.");
    }).catch(() => { if (active) setError("Your purchases could not be checked. Refresh before starting another payment."); })
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, [selection, restore]);

  async function check() {
    if (!reference || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const result = await verify({ data: { reference } });
      // Do not erase an outstanding OTP challenge when a verify call is still pending.
      setStatus(previous => result.status === "pending" && previous === "send_otp" ? previous : result.status);
      setMessage(result.message);
      if (result.status === "paid") setCourses(result.courses);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to check payment. Please try again."); }
    finally { inFlight.current = false; setBusy(false); }
  }

  useEffect(() => {
    if (!reference || status === "paid" || status === "failed") return;
    let attempts = 0;
    const timer = window.setInterval(() => { attempts++; void check(); if (attempts >= 30) window.clearInterval(timer); }, 10000);
    return () => window.clearInterval(timer);
  }, [reference, status]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current || reference || owned) return;
    const form = new FormData(e.currentTarget);
    inFlight.current = true; setBusy(true); setError("");
    try {
      const result = await begin({ data: { selection, provider, email: String(form.get("email")), phone: String(form.get("phone")).trim() } });
      setReference(result.reference); setStatus("pending"); setMessage(result.message);
      if ("accessCode" in result && result.accessCode) {
        const Pop = await loadPaystack();
        new Pop().resumeTransaction(result.accessCode, {
          onSuccess: () => { setMessage("Payment submitted. Verifying with Paystack…"); setTimeout(() => void check(), 500); },
          onCancel: () => setMessage("Paystack window closed. If you approved the prompt, check your payment status."),
        });
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to start payment. Please try again."); }
    finally { inFlight.current = false; setBusy(false); }
  }

  async function submitOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reference || inFlight.current) return;
    const otp = String(new FormData(e.currentTarget).get("otp"));
    inFlight.current = true; setBusy(true); setError("");
    try {
      const result = await sendOtp({ data: { reference, otp } });
      setStatus(result.status === "success" ? "pending" : result.status); setMessage(result.message);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit the code. Please try again."); }
    finally { inFlight.current = false; setBusy(false); }
  }

  return <div className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
    <Link to={course ? "/courses/$id" : "/"} params={{ id: selection }} className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />{course ? "Back to course" : "All courses"}</Link>
    <h1 className="mt-5 text-4xl font-bold">Checkout</h1>
    <div className="mt-7 grid gap-8 md:grid-cols-[1fr_1.15fr]">
      <div className="border-b border-border pb-6 md:border-b-0 md:border-r md:pr-8">
        <p className="font-mono text-xs uppercase text-primary">{selection === "all" ? "Complete collection · 10 courses" : `Course ${selection.padStart(2, "0")}`}</p>
        <h2 className="mt-3 text-2xl font-semibold leading-snug">{title}</h2>
        <p className="mt-6 text-4xl font-bold">GHC {price}<LockKeyhole className="ml-3 inline size-5 text-muted-foreground" /></p>
        {selection === "all" && <p className="mt-2 text-sm text-accent"><s className="text-muted-foreground">GHC 500</s> · Save GHC 200</p>}
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-5 shrink-0 text-success" />Paystack · Secure mobile money payment</p>
      </div>
      <div className="min-w-0">
        {restoring ? <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Checking your purchases…</p> : owned ? <div role="status" className="flex items-center gap-2 font-semibold text-success"><ShieldCheck />Payment verified · Purchased</div> : !reference ? <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={busy}>
            <legend className="mb-3 font-semibold">Mobile money network</legend>
            <div className="grid grid-cols-3 gap-2">{providers.map(p => <Button key={p.id} type="button" variant={provider === p.id ? "default" : "outline"} aria-pressed={provider === p.id} onClick={() => setProvider(p.id)} className="h-20 flex-col gap-1 px-1 whitespace-normal"><Smartphone /><span>{p.name}</span><span className="text-xs font-normal">{p.wallet}</span></Button>)}</div>
          </fieldset>
          <label className="block space-y-2"><span className="text-sm font-medium">Mobile money number</span><input name="phone" required type="tel" autoComplete="tel" pattern="(?:0|233|\+233)[0-9]{9}" placeholder="0241234567" className={input} disabled={busy} /></label>
          <label className="block space-y-2"><span className="text-sm font-medium">Email address</span><input name="email" required type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" className={input} disabled={busy} /></label>
          <Button type="submit" disabled={busy} className="h-12 w-full text-base">{busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Pay GHC {price}</Button>
        </form> : <div className="space-y-5" aria-live="polite">
          <h2 className="text-xl font-semibold">{status === "paid" ? "Payment verified" : status === "failed" ? "Payment not completed" : "Confirm your payment"}</h2>
          <p className="text-muted-foreground">{message}</p>
          <p className="break-all font-mono text-xs text-muted-foreground">Reference: {reference}</p>
          {status === "send_otp" && <form onSubmit={submitOtp} className="space-y-3"><label className="block space-y-2"><span>One-time code</span><input name="otp" required autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{4,10}" className={input} disabled={busy} /></label><Button disabled={busy} type="submit">Submit code</Button></form>}
          {status !== "paid" && status !== "failed" && <Button variant="outline" disabled={busy} onClick={() => void check()} className="h-11 w-full">{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Check payment status</Button>}
          {status !== "paid" && <Button variant={status === "failed" ? "default" : "ghost"} className="w-full" onClick={() => { setReference(null); setStatus("idle"); setError(""); }}>{status === "failed" ? "Try another payment" : "Start a new payment"}</Button>}
        </div>}
        {error && <div role="alert" className="mt-4 space-y-3 text-sm text-destructive"><p>{error}</p>{!reference && <Button variant="outline" onClick={() => window.location.reload()}>Refresh purchases</Button>}</div>}
      </div>
    </div>
    {courses.length > 0 && <PurchaseAccess courses={courses} />}
  </div>;
}
