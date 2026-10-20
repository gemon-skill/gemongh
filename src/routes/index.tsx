import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, ShieldCheck, Zap, Users } from "lucide-react";
import hero from "@/assets/hero.jpg";
import proofVideo from "@/assets/proof-video.mp4.asset.json";
import proofPoster from "@/assets/proof-poster.jpg.asset.json";
import { courses } from "@/lib/courses";
import { CourseCover, Stars } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GEMON — Earn Online with Video + PDF Courses" },
      { name: "description", content: "10 practical courses on Fiverr, Upwork, AI, forex, editing and more. No sign-up — buy instantly." },
      { property: "og:title", content: "GEMON — Earn Online with Video + PDF Courses" },
      { property: "og:description", content: "10 practical income courses. No sign-up, instant access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const siteReviews = [
  { name: "Kwabena O.", text: "Paid with MoMo and had my course in my inbox in under 10 minutes. Fastest I've ever seen.", course: "Fiverr $200" },
  { name: "Gifty A.", text: "GHC 50 for this much value is honestly unfair. I've made it back 20 times over.", course: "AI Web Design" },
  { name: "Daniel T.", text: "No account, no stress. Picked a course, paid, started learning the same night.", course: "Forex Pro" },
];

function Index() {
  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden">
        <img src={hero} alt="Student learning on laptop" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-5 pb-16">
          <span className="mb-4 w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary">No sign-up · Instant access</span>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Learn the skills. <span className="text-water">Earn the income.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">10 step-by-step Video + PDF courses that take you from zero to your first online income.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#courses" className="rounded-md bg-water px-6 py-3 font-semibold text-primary-foreground shadow-glow">Browse courses</a>
            <a href="#proof" className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-6 py-3 font-semibold backdrop-blur"><Play className="h-4 w-4" /> Watch proof</a>
          </div>
          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-6">
            {[["46K+", "Students"], ["4.9/5", "Avg rating"], ["<10 min", "Delivery"]].map(([a, b]) => (
              <div key={b}><p className="text-2xl font-bold md:text-3xl">{a}</p><p className="font-mono text-xs uppercase text-muted-foreground">{b}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-card shadow-glow">
            <video
              src={proofVideo.url}
              poster={proofPoster.url}
              controls
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">// Proof of results</p>
            <h2 className="mt-3 text-4xl font-bold">Real students. Real payouts.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[[Zap, "Instant delivery", "Access sent to your email fast"], [ShieldCheck, "Verified payments", "MoMo & card, every order checked"], [Users, "Active community", "Support via WhatsApp"]].map(([I, t, d]) => {
                const Icon = I as typeof Zap;
                return (
                  <div key={t as string} className="rounded-lg border border-border bg-card p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-semibold">{t as string}</p>
                    <p className="text-sm text-muted-foreground">{d as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary">// What students say</p>
              <h2 className="mt-3 text-4xl font-bold">Rated 4.9 by 12,000+ buyers</h2>
            </div>
            <div className="flex items-center gap-3"><Stars className="h-6 w-6" /><span className="font-mono text-sm text-muted-foreground">4.9 / 5.0</span></div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {siteReviews.map((r) => (
              <figure key={r.name} className="rounded-xl border border-border bg-background p-6">
                <Stars />
                <blockquote className="mt-4 text-lg leading-relaxed">“{r.text}”</blockquote>
                <figcaption className="mt-5 font-mono text-xs text-muted-foreground">{r.name} · {r.course}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">// Catalog</p>
        <h2 className="mt-3 text-4xl font-bold">All courses</h2>
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-accent/50 bg-accent/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-xs font-bold uppercase text-accent-foreground">Save 40%</span>
            <p className="mt-2 text-2xl font-bold">Get all 10 courses for GHC 300</p>
            <p className="text-sm text-muted-foreground"><s>GHC 500</s> · one payment, lifetime access</p>
          </div>
          <Link to="/checkout/$id" params={{ id: "all" }} className="rounded-md bg-accent px-6 py-3 text-center font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-[1.03]">Buy all 10 — GHC 300</Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} to="/courses/$id" params={{ id: c.slug }} className="group flex flex-col rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
              <CourseCover course={c} />
              <div className="flex flex-1 flex-col p-3">
                <h3 className="text-lg font-semibold leading-snug">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2"><Stars n={c.rating} /><span className="font-mono text-xs text-muted-foreground">{c.students} enrolled</span></div>
                  <span className="font-mono text-sm font-semibold text-primary">GHC 50</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
