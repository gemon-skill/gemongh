import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Star, MessageCircle } from "lucide-react";
import { WHATSAPP_URL, type Course } from "@/lib/courses";
import { Button } from "@/components/ui/button";
import gemonLogo from "@/assets/gemon-logo-header.jpg";

export function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ] as const;
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link to="/" aria-label="GEMON home" className="block shrink-0">
          <img src={gemonLogo} alt="GEMON — African Money Generator" width={812} height={280} className="h-12 w-auto max-w-[180px] object-contain" />
        </Link>
        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="font-mono text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</Button>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t border-border bg-background px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-mono text-sm uppercase tracking-wider">{l.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
        <Link to="/" aria-label="GEMON home" className="block shrink-0">
          <img src={gemonLogo} alt="GEMON — African Money Generator" width={812} height={280} loading="lazy" className="h-auto w-56 max-w-full" />
        </Link>
        <p className="font-mono text-xs text-muted-foreground">(C)2026 Gemon.Co</p>
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Help on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-success px-4 py-3 font-semibold text-background shadow-glow transition-transform hover:scale-105">
      <MessageCircle className="h-5 w-5" /> <span className="hidden sm:inline">Need help?</span>
    </a>
  );
}

export function Stars({ n = 5, className = "h-4 w-4" }: { n?: number; className?: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < n ? "fill-accent text-accent" : "text-muted"}`} />
      ))}
    </div>
  );
}

const flyers = import.meta.glob<string>("@/assets/flyers/course-*.jpg", { eager: true, import: "default" });
const flyerFor = (id: number) => Object.entries(flyers).find(([k]) => k.endsWith(`/course-${id}.jpg`))?.[1];

export function CourseCover({ course, large }: { course: Course; large?: boolean }) {
  const img = flyerFor(course.id);
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-card">
      {img && <img src={img} alt={`${course.title} course flyer`} loading="lazy" width={1280} height={720} className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <span className={`absolute right-3 top-3 flex flex-col items-center rounded-lg border border-foreground/20 bg-background/70 font-bold leading-none backdrop-blur ${large ? "px-4 py-2" : "px-3 py-1.5"}`}>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Course</span>
        <span className={`text-water ${large ? "text-4xl" : "text-2xl"}`}>{String(course.id).padStart(2, "0")}</span>
      </span>
      <div className="absolute bottom-4 left-4 right-4">
        <span className="rounded-full border border-foreground/20 bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur">Video + PDF</span>
        <p className={`mt-2 font-bold leading-tight ${large ? "text-3xl md:text-4xl" : "text-xl"}`}>{course.short}</p>
      </div>
    </div>
  );
}
