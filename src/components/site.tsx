import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Star, MessageCircle } from "lucide-react";
import { WHATSAPP_URL, type Course } from "@/lib/courses";

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
        <Link to="/" className="text-2xl font-bold tracking-[0.2em] text-water">GEMON</Link>
        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="font-mono text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
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
        <span className="text-xl font-bold tracking-[0.2em] text-water">GEMON</span>
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

export function CourseCover({ course, large }: { course: Course; large?: boolean }) {
  const h = course.hue;
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border"
      style={{ background: `radial-gradient(circle at 20% 20%, oklch(0.55 0.18 ${h}) 0%, transparent 55%), radial-gradient(circle at 85% 90%, oklch(0.45 0.15 ${h + 40}) 0%, transparent 50%), oklch(0.14 0 0)` }}>
      <div className="absolute inset-0 grid-bg opacity-40" />
      <span className={`absolute right-4 top-2 font-mono font-bold text-foreground/15 ${large ? "text-9xl" : "text-7xl"}`}>{String(course.id).padStart(2, "0")}</span>
      <div className="absolute bottom-4 left-4 right-4">
        <span className="rounded-full border border-foreground/20 bg-background/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur">Video + PDF</span>
        <p className={`mt-2 font-bold leading-tight ${large ? "text-3xl md:text-4xl" : "text-xl"}`}>{course.short}</p>
      </div>
    </div>
  );
}
