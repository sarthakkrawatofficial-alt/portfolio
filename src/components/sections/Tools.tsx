import SectionHead from "./SectionHead";

// Simple original glyphs (not official logos) keyed by keyword.
const GLYPHS: [RegExp, React.ReactNode][] = [
  [/premiere/i, <path key="p" d="M3 5h18v14H3zM3 9h18M3 15h18M7 5v4M12 5v4M17 5v4M7 15v4M12 15v4M17 15v4" />],
  [/after effects/i, <path key="a" d="M12 3l4 4-4 4-4-4zM5 13l3 3-3 3-3-3zM19 13l3 3-3 3-3-3zM8 16h8" />],
  [/davinci|resolve/i, <g key="d"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 4v5M12 15v5M4 12h5M15 12h5" /></g>],
  [/photoshop/i, <path key="ps" d="M4 8l8-4 8 4-8 4zM4 12l8 4 8-4M4 16l8 4 8-4" />],
  [/illustrator/i, <path key="i" d="M4 19C8 5 16 5 20 19M4 19h.01M20 19h.01M12 7V3M9 3h6" />],
  [/figma/i, <path key="f" d="M3 3h18v18H3zM3 9h18M9 9v12" />],
  [/audition|audio/i, <path key="au" d="M3 12h2M7 8v8M11 4v16M15 7v10M19 10v4M21 12h0" />],
];
const glyph = (t: string) => GLYPHS.find(([r]) => r.test(t))?.[1] ?? <path d="M12 2c.6 5 3.6 8 10 10-6.4 2-9.4 5-10 10-.6-5-3.6-8-10-10 6.4-2 9.4-5 10-10z" />;

const CRAFT = ["Colour grading", "Sound design", "Kinetic typography", "UI animation", "Captions & subtitles", "Storyboarding", "Retention pacing", "Multi-cam edits", "Thumbnails", "Lower thirds"];

export default function Tools({ tools }: { tools: string[] }) {
  const row = [...tools, ...tools, ...tools, ...tools];
  const craft = [...CRAFT, ...CRAFT];
  return (
    <section id="tools" className="relative overflow-hidden pb-8 pt-24 md:pb-12 md:pt-32">
      <div className="wrap">
        <SectionHead index="05" label="Toolkit" lines={["The kit", { text: "behind the cut.", className: "text-fg/35" }]} />
      </div>
      <div className="fade-x marquee-host mt-12 overflow-hidden md:mt-16">
        <div className="marquee pausable py-2" style={{ ["--dur" as string]: "40s" }}>
          {row.map((t, i) => (
            <div key={i} className="mr-4 flex shrink-0 items-center gap-4 rounded-2xl border border-line bg-card py-3 pl-3 pr-6 transition-colors hover:border-lime/50">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-paper to-card2 text-lime shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{glyph(t)}</svg>
              </span>
              <span className="whitespace-nowrap text-xl font-semibold tracking-tight md:text-2xl">{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="fade-x mt-4 overflow-hidden">
        <div className="marquee reverse" style={{ ["--dur" as string]: "55s" }}>
          {craft.map((c, i) => (
            <span key={i} className="label mr-3 shrink-0 whitespace-nowrap rounded-full border border-line px-4 py-2.5 text-fg/60">
              <span className="mr-2 text-lime">+</span>{c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
