import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Smartphone, Lock } from "lucide-react";
import { getCourse, MOMO_NUMBER, PRICE_GHS, PRICE_USD } from "@/lib/courses";

export const Route = createFileRoute("/checkout/$id")({
  loader: ({ params }) => {
    const course = getCourse(params.id);
    if (!course) throw notFound();
    return { course };
  },
  head: () => ({
    meta: [
      { title: "Checkout — GEMON" },
      { name: "description", content: "Pay with MTN MoMo, Telecel Cash or card." },
      { property: "og:title", content: "Checkout — GEMON" },
      { property: "og:description", content: "Secure checkout with MoMo or card." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const input = "w-full rounded-md border border-input bg-background px-4 py-3 outline-none focus:border-primary";

function Checkout() {
  const { course } = Route.useLoaderData();
  const [mode, setMode] = useState<"momo" | "card">("momo");
  const [provider, setProvider] = useState<"mtn" | "telecel">("mtn");
  const ref = `${course.id}+JAMES`;
  const steps = provider === "mtn"
    ? ["Dial *170#", "Select Option 1 “Transfer Money”", "Select Option 1 “Momo User”"]
    : ["Dial *110#", "Select Option 1 “Send Money”", "Select Option 1 “Telecel Cash User”"];
  const all = [
    ...steps,
    <>Enter Merchant Number: <b className="text-foreground">{MOMO_NUMBER}</b> and continue.</>,
    <>Enter the Amount: <b className="text-foreground">GHC {PRICE_GHS}</b></>,
    <>Enter Reference: Course Number + Short Name (e.g. <code className="rounded bg-muted px-1.5 font-mono text-primary">{ref}</code>)</>,
    "Enter your MoMo PIN.",
    "Select 1 to confirm “Yes”.",
  ];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    toast.success("Verification submitted! Check your email for course access shortly.");
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link to="/courses/$id" params={{ id: course.slug }} className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground">← Back to course</Link>
      <h1 className="mt-4 text-4xl font-bold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">Course {course.id}: {course.title}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-2">
        {([["momo", Smartphone, "Mobile Money (Ghana)", `GHC ${PRICE_GHS}`], ["card", CreditCard, "International Card", `$${PRICE_USD}`]] as const).map(([k, I, l, p]) => (
          <button key={k} onClick={() => setMode(k)} className={`flex flex-col items-center gap-1 rounded-lg p-4 text-center transition-colors sm:flex-row sm:justify-between sm:text-left ${mode === k ? "bg-water text-primary-foreground" : "hover:bg-muted"}`}>
            <span className="flex items-center gap-2 font-semibold"><I className="h-5 w-5" />{l}</span>
            <span className="font-mono text-sm">{p}</span>
          </button>
        ))}
      </div>

      {mode === "momo" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setProvider("mtn")} className={`flex h-20 items-center justify-center rounded-xl border-2 bg-mtn transition-opacity ${provider === "mtn" ? "border-foreground" : "border-transparent opacity-50"}`}>
                <span className="rounded-[50%] border-2 border-background px-4 py-1 text-xl font-black text-background">MTN</span>
                <span className="ml-2 font-bold text-background">MoMo</span>
              </button>
              <button onClick={() => setProvider("telecel")} className={`flex h-20 items-center justify-center rounded-xl border-2 bg-telecel transition-opacity ${provider === "telecel" ? "border-foreground" : "border-transparent opacity-50"}`}>
                <span className="text-xl font-bold lowercase text-foreground">telecel</span>
                <span className="ml-2 font-semibold text-foreground">Cash</span>
              </button>
            </div>
            <ol className="mt-6 space-y-3">
              {all.map((s, i) => (
                <li key={i} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-semibold text-primary">{i + 1}</span>
                  <span className="text-muted-foreground"><span className="font-mono text-xs uppercase text-foreground">Step {i + 1}: </span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <form onSubmit={submit} className="h-fit space-y-5 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold">Verify your payment</h2>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Transaction ID + MoMo Reference</span>
              <input required className={input} placeholder={`92305761031+${ref}`} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Active Email Address</span>
              <input required type="email" className={input} placeholder="you@example.com" />
              <span className="block text-xs text-muted-foreground">To receive your instant course access notification.</span>
            </label>
            <button className="w-full rounded-md bg-water py-3 font-semibold text-primary-foreground shadow-glow">Submit Payment Verification</button>
          </form>
        </div>
      ) : (
        <form onSubmit={submit} className="mx-auto mt-8 max-w-lg space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Card payment</h2>
            <span className="text-3xl font-bold text-water">${PRICE_USD}.00 USD</span>
          </div>
          <input required className={input} placeholder="Card number" inputMode="numeric" />
          <div className="grid grid-cols-2 gap-4">
            <input required className={input} placeholder="MM / YY" />
            <input required className={input} placeholder="CVV" inputMode="numeric" />
          </div>
          <select required className={input} defaultValue="">
            <option value="" disabled>Country</option>
            {["United States", "United Kingdom", "Nigeria", "Canada", "Germany", "South Africa", "Kenya", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <input required type="email" className={input} placeholder="Email for course access" />
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-water py-3 font-semibold text-primary-foreground shadow-glow"><Lock className="h-4 w-4" /> Pay ${PRICE_USD}.00</button>
          <p className="text-center text-xs text-muted-foreground">Card processing is a preview — connect a payment provider to charge cards.</p>
        </form>
      )}
    </div>
  );
}
