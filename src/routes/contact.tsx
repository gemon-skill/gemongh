import { createFileRoute } from "@tanstack/react-router";
import { Phone, Facebook, Instagram, MessageCircle, Ghost, Twitter, Mail } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/courses";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GEMON — Hotlines & Socials" },
      { name: "description", content: "Call, WhatsApp or message GEMON on Facebook, Instagram, X and Snapchat." },
      { property: "og:title", content: "Contact GEMON" },
      { property: "og:description", content: "Reach us by phone, WhatsApp or social media." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const socials = [
  { icon: MessageCircle, name: "WhatsApp", handle: "+233 53 927 9325", href: WHATSAPP_URL },
  { icon: Facebook, name: "Facebook", handle: "@gemon.co", href: "https://facebook.com/gemon.co" },
  { icon: Instagram, name: "Instagram", handle: "@gemon.co", href: "https://instagram.com/gemon.co" },
  { icon: Twitter, name: "X", handle: "@gemonco", href: "https://x.com/gemonco" },
  { icon: Ghost, name: "Snapchat", handle: "@gemonco", href: "https://snapchat.com/add/gemonco" },
];

function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">// Contact</p>
      <h1 className="mt-3 text-5xl font-bold">Talk to us.</h1>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <a href="tel:+233539279325" className="rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/50">
          <Phone className="h-6 w-6 text-primary" />
          <p className="mt-4 font-mono text-xs uppercase text-muted-foreground">Hotline · Live</p>
          <p className="mt-1 text-3xl font-bold">+233 53 927 9325</p>
        </a>
        <a href="mailto:support@gemon.co" className="rounded-xl border border-border bg-card p-8 transition-colors hover:border-primary/50">
          <Mail className="h-6 w-6 text-primary" />
          <p className="mt-4 font-mono text-xs uppercase text-muted-foreground">Email</p>
          <p className="mt-1 text-3xl font-bold">support@gemon.co</p>
        </a>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {socials.map(({ icon: I, name, handle, href }) => (
          <a key={name} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-water"><I className="h-5 w-5 text-primary-foreground" /></span>
            <div className="min-w-0"><p className="font-semibold">{name}</p><p className="truncate font-mono text-xs text-muted-foreground">{handle}</p></div>
          </a>
        ))}
      </div>
    </div>
  );
}
