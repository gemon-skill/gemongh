import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { LockKeyhole, ShieldCheck, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { getCourse, PRICE_GHS, BUNDLE_GHS } from "@/lib/courses";
import { checkPayment, getPurchaseState, submitPaymentOtp } from "@/lib/paystack.functions";
import { Button } from "@/components/ui/button";
import { PurchaseAccess } from "@/components/purchase-access";
import { BuyButton } from "@/components/buy-button";

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
const WALLET_APPROVAL_SECONDS = 14;

function Checkout() {
  const { selection, course, title, price } = Route.useLoaderData();
  const verify = useServerFn(checkPayment);
  const restore = useServerFn(getPurchaseState);
  const sendOtp = useServerFn(submitPaymentOtp);
  const [reference, setReference] = useState<string | null>(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [approvalWait, setApprovalWait] = useState(0);
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

  async function check(paymentReference = reference) {
    if (!paymentReference || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const result = await verify({ data: { reference: paymentReference } });
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
    let timer: number | undefined;
    const waitingForWallet = status === "pending";
    setApprovalWait(waitingForWallet ? WALLET_APPROVAL_SECONDS : 0);
    const countdown = waitingForWallet ? window.setInterval(() => setApprovalWait(seconds => Math.max(0, seconds - 1)), 1000) : undefined;
    const start = window.setTimeout(() => {
      if (countdown !== undefined) window.clearInterval(countdown);
      setApprovalWait(0);
      void check(reference);
      timer = window.setInterval(() => { attempts++; void check(reference); if (attempts >= 30 && timer !== undefined) window.clearInterval(timer); }, 10000);
    }, waitingForWallet ? WALLET_APPROVAL_SECONDS * 1000 : 10000);
    return () => {
      window.clearTimeout(start);
      if (countdown !== undefined) window.clearInterval(countdown);
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [reference, status]);

  async function submitOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reference || inFlight.current) return;
    const otp = String(new FormData(e.currentTarget).get("otp"));
    inFlight.current = true; setBusy(true); setError("");
    let approved = false;
    try {
      const result = await sendOtp({ data: { reference, otp } });
      setStatus(result.status === "success" ? "pending" : result.status); setMessage(result.message);
      approved = result.status === "success";
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit the code. Please try again."); }
    finally { inFlight.current = false; setBusy(false); }
    if (approved) void check(reference);
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
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-5 shrink-0 text-success" />Paystack · Secure mobile money or card payment</p>
      </div>
      <div className="min-w-0">
        {restoring ? <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Checking your purchases…</p> : owned ? <div role="status" className="flex items-center gap-2 font-semibold text-success"><ShieldCheck />Payment verified · Purchased</div> : !reference ? <div className="space-y-5"><p className="text-sm text-muted-foreground">MTN · Telecel · AirtelTigo · Card</p><BuyButton selection={selection} className="h-12 w-full text-base" /></div> : <div className="space-y-5" aria-live="polite">
          <h2 className="text-xl font-semibold">{status === "paid" ? "Payment verified" : status === "failed" ? "Payment not completed" : "Confirm your payment"}</h2>
          <p className="text-muted-foreground">{message}</p>
          {status === "pending" && approvalWait > 0 && <p role="status" className="flex items-center gap-2 text-sm text-primary"><Loader2 className="size-4 shrink-0 animate-spin" />Waiting for wallet authorization · {approvalWait}s</p>}
          {status === "pending" && <p className="text-sm text-muted-foreground">Approve GHC {price} in your network’s secure prompt on your phone. Never enter your Mobile Money PIN on this website. Prompt timing depends on MTN, Telecel or AirtelTigo.</p>}
          <p className="break-all font-mono text-xs text-muted-foreground">Reference: {reference}</p>
          {status === "send_otp" && <form onSubmit={submitOtp} className="space-y-3"><label className="block space-y-2"><span>One-time code</span><input name="otp" required autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{4,10}" className={input} disabled={busy} /></label><Button disabled={busy} type="submit">Submit code</Button></form>}
          {status !== "paid" && status !== "failed" && <Button variant="outline" disabled={busy || (status === "pending" && approvalWait > 0)} onClick={() => void check()} className="h-11 w-full">{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Check payment status</Button>}
          {status === "failed" && <Button className="w-full" disabled={busy} onClick={() => { setReference(null); setStatus("idle"); setError(""); }}>Try another payment</Button>}
        </div>}
        {error && <div role="alert" className="mt-4 space-y-3 text-sm text-destructive"><p>{error}</p>{!reference && <Button variant="outline" onClick={() => window.location.reload()}>Refresh purchases</Button>}</div>}
      </div>
    </div>
    {courses.length > 0 && <PurchaseAccess courses={courses} />}
  </div>;
}
