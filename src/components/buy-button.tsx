import { useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LockKeyhole, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { initializeHostedPayment, checkPayment, getPurchaseState } from "@/lib/paystack.functions";
import { emailCheckoutSchema, paymentSelection } from "@/lib/payment-rules";
import { checkoutPublicKey, loadPaystack } from "@/lib/paystack-inline";
import { PurchaseAccess } from "@/components/purchase-access";

export function BuyButton({ selection, children, className }: { selection: string; children?: ReactNode; className?: string }) {
  const initialize = useServerFn(initializeHostedPayment);
  const verify = useServerFn(checkPayment);
  const restore = useServerFn(getPurchaseState);
  const purchase = paymentSelection(selection);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [status, setStatus] = useState("email");
  const [message, setMessage] = useState("");
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function check(ref = reference) {
    if (!ref || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      const result = await verify({ data: { reference: ref } });
      if (!mounted.current) return;
      setStatus(result.status); setMessage(result.message);
      if (result.status === "paid") setCourses(result.courses);
    } catch (error) { if (mounted.current) setError(error instanceof Error ? error.message : "Payment verification failed. Please check again; do not pay twice."); }
    finally { inFlight.current = false; if (mounted.current) setBusy(false); }
  }

  useEffect(() => {
    if (!open || !reference || status === "paid" || status === "failed") return;
    let attempts = 0;
    const first = window.setTimeout(() => void check(reference), 14000);
    const polling = window.setInterval(() => { attempts++; if (attempts <= 30) void check(reference); else window.clearInterval(polling); }, 24000);
    return () => { window.clearTimeout(first); window.clearInterval(polling); };
  }, [open, reference, status]);

  async function showPopup(code: string, ref: string) {
    const Pop = await loadPaystack();
    // Release Radix's focus trap before opening the provider's own dialog.
    setOpen(false);
    await new Promise<void>(resolve => window.setTimeout(resolve, 0));
    new Pop().resumeTransaction(code, {
      onSuccess: () => { setOpen(true); setMessage("Payment submitted. Verifying with Paystack…"); void check(ref); },
      onCancel: () => { setOpen(true); setMessage("Payment window closed. Reopen it or check payment status before paying again."); },
      onError: issue => { setOpen(true); setError(issue.message || "Paystack could not open this payment. Try reopening the payment window."); },
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    let popup: { code: string; ref: string } | null = null;
    try {
      const data = emailCheckoutSchema.safeParse({ selection, email });
      if (!data.success) throw new Error("Enter a valid email address.");
      // Load before creating an order: a blocked script must not strand a payment.
      await loadPaystack();
      const existing = await restore({ data: { selection } });
      if (existing.unavailable) throw new Error("Purchase verification is unavailable. Please try again before paying.");
      const owned = selection === "all" ? existing.courses.length === 10 : existing.courses.some(course => course.id === selection);
      if (owned) { setCourses(existing.courses); setStatus("paid"); setMessage("Payment verified. Your purchase is confirmed."); return; }
      if (existing.pendingReference) { setReference(existing.pendingReference); setStatus("pending"); setMessage("An earlier payment is awaiting confirmation. Check its status before paying again."); return; }
      const result = await initialize({ data: data.data });
      setReference(result.reference); setAccessCode(result.accessCode); setStatus("pending");
      setMessage(result.accessCode ? "Complete your payment in the Paystack window." : "Paystack has not confirmed initialization. Check this reference before paying again.");
      checkoutPublicKey(result.publicKey);
      if (result.amount !== purchase.amount || result.currency !== "GHS") throw new Error("Paystack initialization failed: the course amount or currency does not match.");
      if (result.accessCode) popup = { code: result.accessCode, ref: result.reference };
      else setError("Payment initialization is awaiting confirmation. No second payment has been created.");
    } catch (error) { setOpen(true); setError(error instanceof Error ? error.message : "Paystack initialization failed. Please try again."); }
    finally { inFlight.current = false; setBusy(false); }
    if (popup) {
      try { await showPopup(popup.code, popup.ref); }
      catch (error) { setOpen(true); setError(error instanceof Error ? error.message : "Paystack payment window failed to open."); }
    }
  }

  return <>
    <Button className={className} onClick={() => setOpen(true)}>{children ?? <><LockKeyhole />Pay GHC {purchase.amount / 100}</>}</Button>
    <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg" onInteractOutside={event => { if (busy) event.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>{status === "paid" ? "Payment verified" : reference ? "Your payment" : "Complete your purchase"}</DialogTitle>
          <DialogDescription>{purchase.title}</DialogDescription>
        </DialogHeader>
        <p className="text-3xl font-semibold">GHC {purchase.amount / 100}</p>
        {!reference && status !== "paid" ? <form onSubmit={submit} className="space-y-5">
          <label className="block space-y-2"><span className="text-sm font-medium">Email Address</span><input type="email" name="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} placeholder="you@example.com" className="h-12 w-full rounded-md border border-input bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-ring" /></label>
          <p className="text-sm text-muted-foreground">Mobile money or card · Secure payment by Paystack</p>
          <Button type="submit" className="h-12 w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Continue to Paystack</Button>
        </form> : <div className="space-y-4" aria-live="polite">
          <p className="text-sm text-muted-foreground">{message}</p>
          {reference && <p className="break-all font-mono text-xs text-muted-foreground">Reference: {reference}</p>}
          {status !== "paid" && status !== "failed" && <>
            {accessCode && reference && <Button className="h-11 w-full" disabled={busy} onClick={() => void showPopup(accessCode, reference).catch(error => { setOpen(true); setError(error instanceof Error ? error.message : "Unable to open Paystack."); })}>Reopen Paystack</Button>}
            <Button variant="outline" className="h-11 w-full" disabled={busy} onClick={() => void check()}>{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Check payment status</Button>
          </>}
          {status === "failed" && <Button className="w-full" onClick={() => { setReference(null); setAccessCode(null); setStatus("email"); setError(""); }}>Try another payment</Button>}
          {status === "paid" && <PurchaseAccess courses={courses} />}
        </div>}
        {error && <p role="alert" className="break-words rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  </>;
}