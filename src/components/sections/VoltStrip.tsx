const WORDS = ["Motion design", "Video editing", "SaaS explainers", "Reels & shorts", "Podcasts", "Story first", "Available for freelance"];

/** Two crossing ticker tapes — a loud accent band between sections. */
export default function VoltStrip() {
  const row = [...WORDS, ...WORDS, ...WORDS];
  return (
    <div aria-hidden className="relative my-10 h-40 overflow-hidden md:my-16 md:h-52">
      <div className="absolute left-[-5%] top-1/2 w-[110%] -translate-y-1/2 rotate-[4deg] border-y border-line bg-card2 py-3">
        <div className="marquee reverse" style={{ ["--dur" as string]: "60s" }}>
          {row.map((w, i) => (
            <span key={i} className="label flex shrink-0 items-center gap-6 whitespace-nowrap pr-6 text-[13px] text-muted">
              {w}<span className="text-lime">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="absolute left-[-5%] top-1/2 w-[110%] -translate-y-1/2 -rotate-[3deg] bg-lime py-3.5 shadow-[0_20px_60px_-20px_color-mix(in_srgb,var(--color-lime)_60%,transparent)]">
        <div className="marquee" style={{ ["--dur" as string]: "40s" }}>
          {row.map((w, i) => (
            <span key={i} className="flex shrink-0 items-center gap-6 whitespace-nowrap pr-6 text-xl font-bold uppercase tracking-tight text-bg md:text-2xl">
              {w}
              <svg width="18" height="18" viewBox="0 0 10 10" aria-hidden><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
