import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, FileText, PlayCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCourse } from "@/lib/courses";
import { CourseCover, Stars } from "@/components/site";

export const Route = createFileRoute("/courses/$id")({
  loader: ({ params }) => {
    const course = getCourse(params.id);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.course.title} — GEMON` },
          { name: "description", content: loaderData.course.tagline },
          { property: "og:title", content: loaderData.course.title },
          { property: "og:description", content: loaderData.course.tagline },
          { property: "og:type", content: "product" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Course not found — GEMON" }, { name: "robots", content: "noindex" }],
  }),
  component: CoursePage,
});

function CoursePage() {
  const { course } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <Link to="/" className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground">← All courses</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <CourseCover course={course} large />
        <div className="flex flex-col justify-center">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Course {String(course.id).padStart(2, "0")}</span>
          <h1 className="mt-2 text-4xl font-bold leading-tight">{course.title}</h1>
          <div className="mt-4 flex items-center gap-3"><Stars n={course.rating} className="h-5 w-5" /><span className="font-mono text-sm text-muted-foreground">{course.students} enrolled</span></div>
          <p className="mt-6 text-4xl font-bold">GHC 50 <span className="text-lg font-normal text-muted-foreground">/ $5 intl</span></p>
          <CTA id={course.slug} external={course.externalCta} />
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-2xl font-bold">What you'll master</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{course.description}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {course.outcomes.map((o) => <li key={o} className="flex gap-3 rounded-lg border border-border bg-card p-4"><CheckCircle2 className="h-5 w-5 shrink-0 text-success" />{o}</li>)}
          </ul>
          <h2 className="mt-12 text-2xl font-bold">Course outline</h2>
          <Accordion type="single" collapsible defaultValue="m0" className="mt-4 rounded-xl border border-border bg-card px-5">
            {course.modules.map((m, i) => (
              <AccordionItem key={m.title} value={`m${i}`}>
                <AccordionTrigger className="text-left">{m.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {m.items.map((it) => (
                      <li key={it} className="flex items-center gap-2 text-muted-foreground">
                        {it.startsWith("PDF") ? <FileText className="h-4 w-4 text-accent" /> : <PlayCircle className="h-4 w-4 text-primary" />}{it}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Student reviews</h2>
          <div className="mt-4 space-y-4">
            {course.reviews.map((r) => (
              <figure key={r.name} className="rounded-xl border border-border bg-card p-6">
                <Stars />
                <blockquote className="mt-3 leading-relaxed">“{r.text}”</blockquote>
                <figcaption className="mt-4 font-mono text-xs text-muted-foreground">{r.name} · {r.location}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-primary/40 bg-primary/5 p-6">
            <p className="text-lg font-semibold">Ready to start?</p>
            <p className="text-sm text-muted-foreground">No account needed. Pay and get access by email.</p>
            <CTA id={course.slug} external={course.externalCta} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CTA({ id, external }: { id: string; external?: { label: string; href: string } | undefined }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link to="/checkout/$id" params={{ id }} className="flex items-center gap-2 rounded-md bg-water px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
        Buy now <ArrowRight className="h-4 w-4" />
      </Link>
      {external && (
        <a href={external.href} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border border-border px-6 py-3 font-semibold hover:border-primary/50">
          {external.label} <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
