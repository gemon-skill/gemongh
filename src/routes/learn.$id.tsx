import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { LockKeyhole, CheckCircle2, MessageCircle } from "lucide-react";
import { getCourse, WHATSAPP_URL } from "@/lib/courses";
import { getPurchaseState } from "@/lib/paystack.functions";
import { Button } from "@/components/ui/button";

const accessQuery = (id: string) => queryOptions({ queryKey: ["course-access", id], queryFn: () => getPurchaseState({ data: { selection: id } }), staleTime: 0 });
export const Route = createFileRoute("/learn/$id")({
  loader: async ({ params, context }) => {
    const course = getCourse(params.id);
    if (!course) throw notFound();
    await context.queryClient.ensureQueryData(accessQuery(params.id));
    return { course };
  },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.course.title ?? "Your course"} · Learning access — GEMON` },
    { name: "description", content: "Your verified GEMON course purchase and learning materials." },
    { property: "og:title", content: "GEMON · Your course access" },
    { property: "og:description", content: "Access your course after verified payment." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: LearningPage,
});
function LearningPage() {
  const { course } = Route.useLoaderData();
  const { data: access } = useSuspenseQuery(accessQuery(course.slug));
  const owned = access.courses.some(item => item.id === course.slug);
  return <div className="mx-auto max-w-3xl px-5 py-12">
    <Link to="/courses/$id" params={{ id: course.slug }} className="text-sm text-muted-foreground">← Course details</Link>
    <p className="mt-8 font-mono text-xs uppercase text-primary">Course {course.slug.padStart(2, "0")}</p>
    <h1 className="mt-3 text-3xl font-bold leading-tight">{course.title}</h1>
    <section className="mt-8 border-y border-border py-8">
      {owned ? <>
        <p role="status" className="flex items-center gap-2 font-semibold text-success"><CheckCircle2 />Purchase verified</p>
        <h2 className="mt-6 text-xl font-semibold">Course materials</h2>
        <p className="mt-3 text-muted-foreground">The course videos and PDFs are not available yet. Your verified purchase is recorded.</p>
        <Button asChild variant="outline" className="mt-5"><a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><MessageCircle />Contact GEMON</a></Button>
      </> : <>
        <p className="flex items-center gap-2 font-semibold"><LockKeyhole />{access.unavailable ? "Verification temporarily unavailable" : "Payment verification required"}</p>
        <p className="mt-3 text-muted-foreground">{access.unavailable ? "Please check again shortly. Do not pay a second time." : "No verified purchase for this course was found in this browser."}</p>
        <Button asChild className="mt-5"><Link to="/checkout/$id" params={{ id: course.slug }}>Go to checkout</Link></Button>
      </>}
    </section>
  </div>;
}
