import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { explainPayment } from "@/lib/payment-help.functions";

export const Route = createFileRoute("/payment-help")({
  head: () => ({
    meta: [
      { title: "Payment help — GEMON" },
      { name: "description", content: "Describe a payment problem and get a plain explanation of the likely cause and what to do next." },
      { property: "og:title", content: "Payment help — GEMON" },
      { property: "og:description", content: "Get AI-powered help with mobile money or card payment problems for GEMON courses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentHelpPage,
});

function PaymentHelpPage() {
  const explain = useServerFn(explainPayment);
  const [description, setDescription] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (description.trim().length < 10) { setError("Please describe the problem in a few more words."); return; }
    setBusy(true); setError(""); setAnswer("");
    try { setAnswer((await explain({ data: { description } })).answer); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold">Payment help</h1>
      <p className="mt-2 text-muted-foreground">Tell us what happened when you tried to pay. AI-powered help will explain the likely cause and what to do next.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor="problem" className="text-sm font-medium">What went wrong?</label>
        <Textarea id="problem" rows={5} maxLength={1500} value={description} onChange={e => setDescription(e.target.value)}
          placeholder="e.g. I entered my MTN number but the PIN prompt never showed on my phone." />
        <p className="text-xs text-muted-foreground">Never type your MoMo PIN, card number or OTP here.</p>
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />}{busy ? "Thinking…" : "Explain my problem"}</Button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      {answer && <div className="mt-6 whitespace-pre-wrap rounded-lg border border-border bg-card p-5 text-sm leading-relaxed">{answer}</div>}
    </section>
  );
}
