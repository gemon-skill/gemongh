export const WHATSAPP_URL = "https://wa.me/233539279325";
export const MOMO_NUMBER = "0539279325";
export const PRICE_GHS = 50;
export const PRICE_USD = 5;

export type Course = {
  id: number;
  slug: string;
  short: string;
  title: string;
  tagline: string;
  students: string;
  rating: number;
  hue: number;
  outcomes: string[];
  description: string;
  modules: { title: string; items: string[] }[];
  reviews: { name: string; location: string; text: string }[];
  externalCta?: { label: string; href: string };
};

const mk = (c: Omit<Course, "slug">): Course => ({ ...c, slug: String(c.id) });

export const courses: Course[] = [
  mk({
    id: 1, short: "Golden Income", title: "New Oil Golden Income of $2,000 / Month",
    tagline: "Agency frameworks inspired by Iman Gadzhi strategy", students: "4.2K+", rating: 5, hue: 85,
    description: "A complete system for building a lean digital service agency. You'll learn to pick a profitable niche, package an irresistible offer, land clients with cold outreach and deliver results using simple, repeatable processes — the same frameworks top agency owners use to scale.",
    outcomes: ["Choose a high-paying niche in one afternoon", "Write outreach scripts that book calls", "Close your first retainer client", "Systemise delivery to reach $2,000/month"],
    modules: [
      { title: "Module 1 — The New Oil Mindset", items: ["Video: Why digital services are the new oil", "PDF: Niche selection worksheet"] },
      { title: "Module 2 — Building the Offer", items: ["Video: Crafting a no-brainer offer", "PDF: Offer template"] },
      { title: "Module 3 — Client Acquisition", items: ["Video: Cold outreach that converts", "PDF: 30 proven DM & email scripts"] },
      { title: "Module 4 — Scaling to $2K", items: ["Video: Delivery systems & hiring", "PDF: Monthly revenue tracker"] },
    ],
    reviews: [
      { name: "Kwame A.", location: "Accra", text: "Landed my first $600 client in week three. The outreach scripts alone are worth 10x the price." },
      { name: "Esi M.", location: "Kumasi", text: "Clear, practical and zero fluff. I finally understand how agencies actually make money." },
    ],
  }),
  mk({
    id: 2, short: "AI Web Design", title: "AI Prompt Website Design + Your First $100",
    tagline: "Design and sell websites using AI prompts", students: "3.1K+", rating: 5, hue: 220,
    description: "Learn to design beautiful, modern websites in hours using AI prompting — no coding background required. Then follow a step-by-step plan to sell your first website and earn your first $100.",
    outcomes: ["Write prompts that generate pro-level websites", "Build a portfolio of 3 sites", "Price and pitch to local businesses", "Earn your first $100"],
    modules: [
      { title: "Module 1 — Prompting Fundamentals", items: ["Video: Anatomy of a great prompt", "PDF: 50 website prompt library"] },
      { title: "Module 2 — Building Sites", items: ["Video: Landing pages, portfolios & shops", "PDF: Design checklist"] },
      { title: "Module 3 — First $100", items: ["Video: Finding & pitching clients", "PDF: Pricing & proposal template"] },
    ],
    reviews: [
      { name: "Yaw B.", location: "Takoradi", text: "Built a site for a barbershop near me and got paid GHC 1,500. This course works." },
      { name: "Abena K.", location: "Tema", text: "The prompt library is gold. I design in minutes now." },
    ],
  }),
  mk({
    id: 3, short: "Fiverr $200", title: "Getting Your First $200 on Fiverr",
    tagline: "From zero gigs to your first $200", students: "5.6K+", rating: 5, hue: 150,
    description: "Everything you need to set up a Fiverr profile that ranks, create gigs buyers click, and deliver orders that earn 5-star reviews — leading you to your first $200.",
    outcomes: ["Create a profile that builds trust", "Write gig titles that rank", "Get your first order fast", "Reach $200 in earnings"],
    modules: [
      { title: "Module 1 — Profile Setup", items: ["Video: Account & verification", "PDF: Profile copy templates"] },
      { title: "Module 2 — Gigs That Rank", items: ["Video: SEO for Fiverr", "PDF: Keyword research sheet"] },
      { title: "Module 3 — Orders & Reviews", items: ["Video: Delivering 5-star work", "PDF: Client message scripts"] },
    ],
    reviews: [
      { name: "Kofi D.", location: "Cape Coast", text: "First order came in 4 days after following module 2. Now at $340." },
      { name: "Ama S.", location: "Accra", text: "I had a dead profile for months. This fixed it completely." },
    ],
  }),
  mk({
    id: 4, short: "AI Graphics", title: "AI Graphic Designing",
    tagline: "Create flyers, logos and brand kits with AI", students: "3.8K+", rating: 5, hue: 330,
    description: "Master AI tools to produce professional flyers, logos, social media graphics and brand kits — fast enough to serve multiple clients a day.",
    outcomes: ["Design logos and brand kits", "Produce social media content packs", "Edit and refine AI outputs", "Sell design packages"],
    modules: [
      { title: "Module 1 — AI Design Tools", items: ["Video: Tool walkthroughs", "PDF: Tool comparison guide"] },
      { title: "Module 2 — Real Projects", items: ["Video: Flyers, logos, thumbnails", "PDF: Prompt cheat sheet"] },
      { title: "Module 3 — Selling Designs", items: ["Video: Packaging & pricing", "PDF: Client brief template"] },
    ],
    reviews: [
      { name: "Nana O.", location: "Kumasi", text: "I now design church and event flyers every weekend. Easy extra income." },
      { name: "Efua T.", location: "Ho", text: "Didn't know design could be this simple. Brilliant course." },
    ],
  }),
  mk({
    id: 5, short: "Upwork $100", title: "Getting Your First $100 on Upwork",
    tagline: "Win proposals and land your first contract", students: "2.9K+", rating: 5, hue: 135,
    description: "A practical path to getting approved on Upwork, writing proposals that win, and completing your first $100 contract with a glowing review.",
    outcomes: ["Get your profile approved", "Write winning proposals", "Use connects wisely", "Complete your first $100 job"],
    modules: [
      { title: "Module 1 — Approval", items: ["Video: Profile that gets approved", "PDF: Bio examples"] },
      { title: "Module 2 — Proposals", items: ["Video: The 5-line proposal formula", "PDF: 20 proposal templates"] },
      { title: "Module 3 — First Contract", items: ["Video: Delivering & getting reviewed", "PDF: Contract checklist"] },
    ],
    reviews: [
      { name: "Selorm A.", location: "Accra", text: "The proposal formula got me hired on my 6th application." },
      { name: "Akosua F.", location: "Sunyani", text: "Straight to the point. First $100 done in two weeks." },
    ],
  }),
  mk({
    id: 6, short: "Faceless AI", title: "Faceless Content Creation Monetization with AI",
    tagline: "Grow and monetize channels without showing your face", students: "6.3K+", rating: 5, hue: 0,
    description: "Build faceless YouTube, TikTok and Instagram channels powered by AI scripts, voiceovers and visuals — then monetize through ads, affiliates and brand deals.",
    outcomes: ["Pick a viral faceless niche", "Produce videos fully with AI", "Grow with posting systems", "Monetize multiple ways"],
    modules: [
      { title: "Module 1 — Niche & Strategy", items: ["Video: Profitable faceless niches", "PDF: Niche list"] },
      { title: "Module 2 — AI Production", items: ["Video: Script, voice & visuals", "PDF: Production workflow"] },
      { title: "Module 3 — Monetization", items: ["Video: Ads, affiliates, sponsors", "PDF: Monetization roadmap"] },
    ],
    reviews: [
      { name: "Kojo E.", location: "Accra", text: "My TikTok hit 20K followers in 6 weeks without showing my face." },
      { name: "Adwoa N.", location: "Koforidua", text: "The AI workflow saves me hours every single day." },
    ],
  }),
  mk({
    id: 7, short: "AI Transcriber", title: "Your First $100 as a Transcriber Using AI",
    tagline: "Earn from transcription with AI speed", students: "2.4K+", rating: 5, hue: 190,
    description: "Use AI tools to transcribe audio and video accurately and quickly, find paying transcription platforms and clients, and earn your first $100.",
    outcomes: ["Transcribe 5x faster with AI", "Proofread to 99% accuracy", "Find transcription clients", "Earn your first $100"],
    modules: [
      { title: "Module 1 — AI Transcription", items: ["Video: Tools & setup", "PDF: Formatting standards"] },
      { title: "Module 2 — Quality", items: ["Video: Proofreading techniques", "PDF: Accuracy checklist"] },
      { title: "Module 3 — Getting Paid", items: ["Video: Platforms & clients", "PDF: Platform directory"] },
    ],
    reviews: [
      { name: "Yaa P.", location: "Tamale", text: "Perfect side hustle. I work from my phone in the evenings." },
      { name: "Fiifi R.", location: "Accra", text: "Made my first $100 faster than I expected." },
    ],
  }),
  mk({
    id: 8, short: "Affiliate", title: "Affiliate Marketing",
    tagline: "Earn commissions promoting products you trust", students: "4.7K+", rating: 5, hue: 270,
    description: "Learn how affiliate marketing really works: choosing offers, building traffic, and turning content into commissions — with our Digitstem partner setup.",
    outcomes: ["Pick high-commission offers", "Drive free & paid traffic", "Build content that converts", "Track and scale commissions"],
    modules: [
      { title: "Module 1 — Foundations", items: ["Video: How affiliates get paid", "PDF: Offer selection guide"] },
      { title: "Module 2 — Traffic", items: ["Video: Social, WhatsApp & SEO traffic", "PDF: Content calendar"] },
      { title: "Module 3 — Scaling", items: ["Video: Tracking & optimisation", "PDF: Scaling playbook"] },
    ],
    reviews: [
      { name: "Edem K.", location: "Ho", text: "First commission within a week of joining. Really clear steps." },
      { name: "Afia L.", location: "Accra", text: "Finally understood affiliate marketing properly." },
    ],
    externalCta: { label: "Join via Digitstem", href: "https://digitstem.com/?ref=GEMON" },
  }),
  mk({
    id: 9, short: "Forex Pro", title: "Forex Trading: Beginner to Pro",
    tagline: "Structured trading education with Exness setup", students: "7.9K+", rating: 5, hue: 45,
    description: "From what a pip is to building a disciplined trading plan — learn market structure, risk management and strategy, and set up your Exness account the right way.",
    outcomes: ["Read charts and market structure", "Manage risk like a pro", "Build a personal trading plan", "Open & fund an Exness account"],
    modules: [
      { title: "Module 1 — Forex Basics", items: ["Video: Pips, lots & leverage", "PDF: Forex glossary"] },
      { title: "Module 2 — Analysis", items: ["Video: Technical & price action", "PDF: Strategy playbook"] },
      { title: "Module 3 — Risk & Psychology", items: ["Video: Risk management", "PDF: Trading journal"] },
      { title: "Module 4 — Going Live", items: ["Video: Exness setup", "PDF: Pre-trade checklist"] },
    ],
    reviews: [
      { name: "Kwesi G.", location: "Kumasi", text: "Risk management module changed how I trade completely." },
      { name: "Maame J.", location: "Accra", text: "Best beginner forex course I've taken, and I've tried many." },
    ],
    externalCta: { label: "Open Exness account", href: "https://one.exness.link/a/GEMON" },
  }),
  mk({
    id: 10, short: "Video Editing", title: "Full Video Editing: Beginner to Pro (Laptop & Phone)",
    tagline: "Edit like a pro on any device", students: "5.2K+", rating: 5, hue: 15,
    description: "Learn professional video editing on both laptop and phone — cuts, transitions, color, sound and captions — and start selling editing services to creators and businesses.",
    outcomes: ["Edit on laptop and phone", "Color grade and mix audio", "Create viral short-form edits", "Sell editing services"],
    modules: [
      { title: "Module 1 — Editing Basics", items: ["Video: Interface & cuts (laptop + phone)", "PDF: Shortcut sheet"] },
      { title: "Module 2 — Pro Techniques", items: ["Video: Transitions, color & sound", "PDF: Effects guide"] },
      { title: "Module 3 — Short-Form Mastery", items: ["Video: Reels, TikTok & Shorts", "PDF: Hook formulas"] },
      { title: "Module 4 — Getting Clients", items: ["Video: Portfolio & pricing", "PDF: Client onboarding kit"] },
    ],
    reviews: [
      { name: "Elikem H.", location: "Accra", text: "I edit for three creators now, all from my phone." },
      { name: "Dede W.", location: "Tema", text: "Super detailed and easy to follow. Worth every pesewa." },
    ],
  }),
];

export const getCourse = (id: string) => courses.find((c) => c.slug === id);
