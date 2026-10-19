import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Target, Award, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GEMON — Our Mission & Expertise" },
      { name: "description", content: "Accra-based digital education company helping Africans earn online since 2019." },
      { property: "og:title", content: "About GEMON" },
      { property: "og:description", content: "Our mission, location and track record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  const blocks = [
    { icon: MapPin, t: "Location", d: "Headquartered in Accra, Ghana, serving students across Africa and worldwide through fully digital delivery." },
    { icon: Target, t: "Mission", d: "To make high-income digital skills affordable and practical, so anyone with a phone can build real online income." },
    { icon: Award, t: "Expertise", d: "7+ years of hands-on experience in freelancing, agency building, trading, design and content creation." },
  ];
  const proof = ["46,000+ students enrolled", "10 complete Video + PDF programs", "Thousands of verified MoMo & card orders", "Average delivery under 10 minutes", "Support 7 days a week on WhatsApp"];
  return (
    <div className="mx-auto max-w-7xl px-5 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">// About</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-tight">Practical skills. <span className="text-water">Proven results.</span></h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">GEMON is a digital education company built by working freelancers, agency owners and traders. Every course is something we've done ourselves — and taught to thousands.</p>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {blocks.map(({ icon: I, t, d }) => (
          <div key={t} className="rounded-xl border border-border bg-card p-6">
            <I className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">{t}</h2>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-14 grid gap-10 rounded-xl border border-border bg-card/50 p-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Credentials & track record</h2>
          <p className="mt-3 text-muted-foreground">Registered digital business, operating since 2019.</p>
        </div>
        <ul className="space-y-3">
          {proof.map((p) => <li key={p} className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-success" />{p}</li>)}
        </ul>
      </div>
    </div>
  );
}
