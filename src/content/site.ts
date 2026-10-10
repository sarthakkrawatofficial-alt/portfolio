// Built-in content. Used as-is when Sanity is not configured, and as a fallback
// for any collection that is empty in Sanity. Everything here comes from the
// original portfolio (legacy/index.html).

export type Orientation = "landscape" | "portrait";

export type Project = {
  id: string;
  title: string;
  client: string;
  platform: string;
  role: string;
  category: string;
  youtubeId: string;
  orientation: Orientation;
  description: string;
};

export type Testimonial = {
  name: string;
  company: string;
  quote: string;
  highlight?: string;
  avatar?: string;
  isLogo?: boolean;
};

export type Faq = { question: string; answer: string };
export type Stat = { value: number; suffix: string; label: string };
export type Job = { period: string; place?: string; role: string; company: string; note: string; current?: boolean };

export type Settings = {
  currentCompany: string;
  yearsExperience: number;
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  phoneHref: string;
  instagram: string;
  instagramHandle: string;
  showreelId: string;
  available: boolean;
};

export type SiteContent = {
  settings: Settings;
  stats: Stat[];
  clients: string[];
  projects: Project[];
  testimonials: Testimonial[];
  faqs: Faq[];
  tools: string[];
  journey: Job[];
};

export const CATEGORIES = ["SaaS & Product", "Short-form", "Trailer & Promo", "Documentary"] as const;

export const fallbackContent: SiteContent = {
  settings: {
    currentCompany: "TestMu AI",
    yearsExperience: 3,
    name: "Sarthak Rawat",
    role: "Video Editor & Motion Designer",
    location: "Noida, India",
    email: "sarthakkrawat.official@gmail.com",
    phone: "+91 95987 23609",
    phoneHref: "tel:+919598723609",
    instagram: "https://instagram.com/sarthakk.create",
    instagramHandle: "@sarthakk.create",
    showreelId: "9GsT1Xz1sXc",
    available: true,
  },
  stats: [
    { value: 3, suffix: "", label: "Years cutting & animating" },
    { value: 250, suffix: "+", label: "Projects shipped" },
    { value: 20, suffix: "+", label: "Brands & businesses" },
    { value: 5, suffix: "+", label: "Industries" },
  ],
  clients: [
    "Workstatus",
    "Invoicera",
    "PixelCrayons",
    "ValueCoders",
    "Aromasphere",
    "Satinder Sartaaj India Tour",
    "Apex Professional University",
    "Hillwoods School Noida",
    "Unbeaten Sportswear",
    "Manaaki Healthcare",
  ],
  projects: [
    {
      id: "claude-cowork",
      title: "Claude Cowork",
      client: "Anthropic (Claude)",
      platform: "YouTube",
      role: "Motion design · UI animation",
      category: "SaaS & Product",
      youtubeId: "tK0afJ0TOBw",
      orientation: "landscape",
      description:
        "Product showcase for a collaborative AI workspace — features and workflows walked through with clean UI animation.",
    },
    {
      id: "ai-product-readiness",
      title: "AI Product Readiness",
      client: "ValueCoders",
      platform: "YouTube",
      role: "Motion design · Story",
      category: "SaaS & Product",
      youtubeId: "UwIWbbE8la4",
      orientation: "landscape",
      description:
        "B2B explainer that untangles scalability and operational maturity into one clear, paced narrative.",
    },
    {
      id: "workstatus-explainer",
      title: "Product Explainer",
      client: "Workstatus",
      platform: "YouTube",
      role: "Motion design · Edit",
      category: "SaaS & Product",
      youtubeId: "gO1hzr2F0hM",
      orientation: "landscape",
      description: "Feature-first explainer built to make onboarding easier and the product value obvious, fast.",
    },
    {
      id: "foundr-trailer",
      title: "Cinematic Podcast Trailer",
      client: "Foundr",
      platform: "YouTube",
      role: "Trailer edit · Sound",
      category: "Trailer & Promo",
      youtubeId: "6sahrh9Rfx0",
      orientation: "landscape",
      description: "Trailer cut to land the hook in the first seconds and hold attention through the episode pitch.",
    },
    {
      id: "criccult-doc",
      title: "Documentary-Style Film",
      client: "CricCult",
      platform: "YouTube",
      role: "Documentary edit",
      category: "Documentary",
      youtubeId: "CvlO4_XVo0s",
      orientation: "landscape",
      description: "Real moments shaped into a brand story people actually remember.",
    },
    {
      id: "sartaaj-tour",
      title: "India Tour Promo",
      client: "Satinder Sartaaj India Tour",
      platform: "Reels / Shorts",
      role: "Promo edit",
      category: "Trailer & Promo",
      youtubeId: "zHxI_-M1sOo",
      orientation: "portrait",
      description: "Tour promo that builds pre-show momentum while keeping the artist's story clear at speed.",
    },
    {
      id: "creative-showcase",
      title: "Creative Showcase",
      client: "Personal",
      platform: "Reels / Shorts",
      role: "Motion study",
      category: "Short-form",
      youtubeId: "ULn82D31b24",
      orientation: "portrait",
      description: "A personal study in pacing, transition logic and visual systems that scale across formats.",
    },
    {
      id: "workflow-visibility",
      title: "Workflow Visibility",
      client: "ValueCoders",
      platform: "Reels / Shorts",
      role: "Motion design",
      category: "Short-form",
      youtubeId: "Cpt7PXJ-Y8I",
      orientation: "portrait",
      description: "Social reel on team workflow pain points, real-time visibility and smoother collaboration.",
    },
    {
      id: "llmops-explained",
      title: "LLMOps Explained",
      client: "ValueCoders",
      platform: "Reels / Shorts",
      role: "Motion design · Edit",
      category: "Short-form",
      youtubeId: "aMbeF0Lm67w",
      orientation: "portrait",
      description: "A technical AI topic turned into a short that people finish — and understand.",
    },
    {
      id: "engagement-signal",
      title: "Engagement Signal Detection",
      client: "PixelCrayons",
      platform: "Reels / Shorts",
      role: "Edit · Motion",
      category: "Short-form",
      youtubeId: "mYh6MqWLQuQ",
      orientation: "portrait",
      description: "Short-form B2B piece that sells the service in seconds, built for paid and organic.",
    },
  ],
  testimonials: [
    {
      name: "Anushka Madaan",
      company: "Vrinda Fertility",
      quote:
        "Healthcare content is difficult — it needs to be accurate, warm, and trustworthy all at once. Sarthak understood that instantly. The reels he created for Vrinda Fertility consistently drove engagement and patient inquiries.",
      highlight: "accurate, warm, and trustworthy",
      avatar: "/img/testimonials/anushka-madaan.png",
    },
    {
      name: "Dharmpreet Singh",
      company: "Apex Professional University",
      quote:
        "Sarthak brought our university campaigns to life with a clarity we hadn't seen before. The motion work he delivered for APU was sharp, on-brand, and exactly what our audience responded to. One of the most reliable creatives we've worked with.",
      highlight: "sharp, on-brand, and exactly what our audience responded to",
      avatar: "/img/testimonials/dharmpreet-singh.png",
    },
    {
      name: "Harshita Gupta",
      company: "Hillwoods School Noida",
      quote:
        "Working with Sarthak for Hillwoods was seamless. He picked up our tone quickly and delivered content that felt premium without losing relatability. Fast turnaround, zero compromises on quality.",
      highlight: "delivered content that felt premium without losing relatability",
      avatar: "/img/testimonials/harshita-gupta.png",
    },
    {
      name: "Abhinav Pandey",
      company: "Lallantop",
      quote:
        "During our Mahakumbh 2026 coverage, Sarthak brought the reliability every newsroom needs under pressure. He kept the content pipeline moving and made sure our on-ground storytelling stayed sharp and timely.",
      highlight: "the reliability every newsroom needs under pressure",
      avatar: "/img/testimonials/abhinav-pandey.webp",
    },
    {
      name: "Vinove Software & Services",
      company: "Former employer",
      quote:
        "Sarthak brought clarity and structure to our motion projects in a way that improved how our content was perceived. His work was sharp, on-brand, and aligned with our communication goals. Someone we could trust for end-to-end delivery.",
      highlight: "Someone we could trust for end-to-end delivery.",
      avatar: "/img/testimonials/vinove-logo.png",
      isLogo: true,
    },
    {
      name: "Hemant Gupta",
      company: "Selection Adda",
      quote:
        "Sarthak designed our digital assets with a level of consistency and attention to detail that genuinely improved how our brand was perceived online. He doesn't just execute — he thinks bigger.",
      highlight: "level of consistency and attention to detail",
      avatar: "/img/testimonials/hemant-gupta.png",
    },
    {
      name: "Akash Mishra",
      company: "Digilok Media House",
      quote:
        "Working with Sarthak at Digilok was seamless. He adapted quickly across shoots and editing, delivering content that stayed consistent and high-quality. Fast, dependable, and focused, he handled every project with strong ownership.",
      highlight: "Fast, dependable, and focused",
      avatar: "/img/testimonials/akash-mishra.png",
    },
  ],
  faqs: [
    {
      question: "What kind of projects do you take on?",
      answer:
        "SaaS explainers and product videos, short-form reels, podcast and talking-head edits, trailers and promos, and documentary-style brand films. If the idea needs to be understood quickly and remembered later, it's a fit.",
    },
    {
      question: "Do you only edit, or do you also animate?",
      answer:
        "Both. I cut the story and build the motion — UI animation, kinetic type, captions, lower thirds — so the edit and the graphics are designed together instead of bolted on at the end.",
    },
    {
      question: "What do you need from me to get started?",
      answer:
        "Your footage or assets, a rough idea of who it's for and what they should do after watching, and any references you love (or hate). A short call is usually enough to lock the direction.",
    },
    {
      question: "How do revisions work?",
      answer:
        "You'll see a first cut early, so feedback shapes the edit before polish begins. We agree on revision rounds up front, and I keep notes timestamped so nothing gets lost.",
    },
    {
      question: "Can you deliver for every platform?",
      answer:
        "Yes — 16:9 for YouTube and web, 9:16 for Reels and Shorts, 1:1 or 4:5 for feeds. One master edit, re-framed and re-paced per platform rather than just cropped.",
    },
    {
      question: "Do you work remotely?",
      answer:
        "I'm based in Noida, India and work with clients remotely. Files move through shared links, and we stay in sync over email or calls.",
    },
  ],
  tools: [
    "Premiere Pro",
    "After Effects",
    "DaVinci Resolve",
    "Photoshop",
    "Illustrator",
    "Figma",
    "Audition",
    "AI-assisted workflows",
  ],
  journey: [
    {
      period: "Aug 2026 — Present",
      role: "Motion Designer",
      company: "TestMu AI",
      note: "Conceptualising AI-focused content and producing product, explainer and social videos end to end — from script and storyboard to motion and final edit.",
      current: true,
    },
    {
      period: "Jul 2025 — Aug 2026",
      place: "Noida",
      role: "Motion Graphics Designer",
      company: "Vinove Software & Services",
      note: "Using motion to simplify ideas and shape product stories.",
    },
    {
      period: "Jan 2023 — Jun 2025",
      place: "Prayagraj",
      role: "Creative Lead",
      company: "Digilok Media House",
      note: "Started as a Creative Junior on shoots, edits and fast-turnaround content, and was promoted to Creative Lead in Oct 2024 — owning ideas, pacing and delivery across client accounts and guiding the team.",
    },
  ],
};

export const ytThumb = (id: string, q: "hq" | "maxres" = "hq") =>
  `https://img.youtube.com/vi/${id}/${q === "hq" ? "hqdefault" : "maxresdefault"}.jpg`;

export const ytEmbed = (id: string, opts: { muted?: boolean; controls?: boolean; loop?: boolean } = {}) => {
  const p = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    mute: opts.muted ? "1" : "0",
    controls: opts.controls === false ? "0" : "1",
  });
  if (opts.loop) {
    p.set("loop", "1");
    p.set("playlist", id);
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${p.toString()}`;
};
