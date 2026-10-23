import { Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PurchaseAccess({ courses }: { courses: { id: string; title: string }[] }) {
  return <section className="mt-8 border-t border-border pt-6">
    <h2 className="flex items-center gap-2 text-xl font-semibold"><CheckCircle2 className="text-success" />Your courses</h2>
    <ul className="mt-4 divide-y divide-border">
      {courses.map(course => <li key={course.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <span className="min-w-0 flex-1 font-medium">{course.title}</span>
        <Button asChild variant="outline"><Link to="/learn/$id" params={{ id: course.id }}>Open course <ArrowRight /></Link></Button>
      </li>)}
    </ul>
  </section>;
}