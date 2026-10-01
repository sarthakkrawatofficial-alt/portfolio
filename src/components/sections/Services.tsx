"use client";
import { useRef } from "react";
import SectionHead from "./SectionHead";
import Reveal from "../motion/Reveal";

/* ---------------- CSS 3D extruded icon ---------------- */
const SHAPES: Record<string, string> = {
  cut: "M3 6a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM9 13h9a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3z",
  motion: "M14 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zM2 9h6v2H2zM1 13h6v2H1zM3 17h5v2H3z",
  wave: "M3 10h3v4H3zM7.5 6h3v12h-3zM12 3h3v18h-3zM16.5 7h3v10h-3zM21 10h2v4h-2z",
  reel: "M7 1h10a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3zm3 7v8l6-4z",
  doc: "M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm3 1v2h2V6zm0 5v2h2v-2zm0 5v2h2v-2zm12-10v2h2V6zm0 5v2h2v-2zm0 5v2h2v-2z",
  spark: "M12 1c.6 5.2 3.8 8.4 11 11c-7.2 2.6-10.4 5.8-11 11c-.6-5.2-3.8-8.4-11-11c7.2-2.6 10.4-5.8 11-11z",
};

function Icon3D({ shape }: { shape: keyof typeof SHAPES }) {
  const layers = 10;
  return (
    <div className="icon3d-scene relative h-20 w-20">
      <div className="icon3d relative h-full w-full" style={{ transform: "rotateX(var(--rx,18deg)) rotateY(var(--ry,-24deg))" }}>
        {Array.from({ length: layers }).map((_, i) => {
          const front = i === layers - 1;
          return (
            <div key={i} className="layer" style={{ transform: `translateZ(${i * 1.6}px)` }}>
              <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
                {front && (
                  <defs>
                    <linearGradient id={`g-${shape}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" style={{ stopColor: "color-mix(in srgb, var(--color-lime) 55%, white)" }} />
                      <stop offset="0.45" style={{ stopColor: "color-mix(in srgb, var(--color-lime) 85%, white)" }} />
                      <stop offset="1" style={{ stopColor: "color-mix(in srgb, var(--color-lime) 80%, black)" }} />
                    </linearGradient>
                  </defs>
                )}
                <path d={SHAPES[shape]} fillRule="evenodd" fill={front ? `url(#g-${shape})` : undefined} style={front ? undefined : { fill: `color-mix(in srgb, var(--color-lime) ${40 + i * 5}%, black)` }} />
              </svg>
            </div>
          );
        })}
      </div>
      <div className="absolute -bottom-3 left-1/2 h-3 w-14 -translate-x-1/2 rounded-full bg-[#4a3f2c]/20 blur-md" />
    </div>
  );
}

/* ---------------- mini visuals ---------------- */
function Timeline() {
  const tracks = [
    { n: "V2", clips: [[8, 18, "w"], [44, 22, "w"], [74, 12, "w"]] },
    { n: "V1", clips: [[0, 30, "l"], [31, 26, "l"], [58, 40, "l"]] },
    { n: "A1", clips: [[0, 57, "g"], [58, 40, "g"]] },
    { n: "A2", clips: [[12, 70, "m"]] },
  ] as const;
  const col = { w: "bg-fg/80", l: "bg-lime", g: "bg-fg/15", m: "bg-fg/25" };
  return (
    <div className="relative mt-auto rounded-2xl border border-line bg-paper p-3">
      <div className="label mb-2 flex justify-between text-[9px] text-muted">
        <span>SEQ_01 · 23.976</span>
        <span className="text-lime">00:00:42:17</span>
      </div>
      <div className="relative mb-2 flex h-3 items-end justify-between overflow-hidden pl-8 opacity-50">
        {Array.from({ length: 81 }).map((_, i) => <span key={i} className="w-px shrink-0 bg-fg" style={{ height: i % 5 === 0 ? 10 : 4 }} />)}
      </div>
      <div className="space-y-1.5">
        {tracks.map((t) => (
          <div key={t.n} className="flex items-center gap-2">
            <span className="label w-6 text-[9px] text-muted">{t.n}</span>
            <div className="relative h-6 flex-1 rounded-md bg-fg/[0.03]">
              {t.clips.map(([l, w, c], i) => (
                <span key={i} className={`absolute inset-y-0.5 rounded-[5px] ${col[c]} ${c === "g" || c === "m" ? "overflow-hidden" : ""}`} style={{ left: `${l}%`, width: `${w}%` }}>
                  {(c === "g" || c === "m") && (
                    <span className="flex h-full items-center gap-[2px] px-1">
                      {Array.from({ length: 30 }).map((_, k) => <span key={k} className="w-[2px] shrink-0 rounded bg-lime/70" style={{ height: `${25 + ((k * 37) % 70)}%` }} />)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <span className="absolute bottom-2 top-8 w-px bg-lime shadow-[0_0_12px_2px_rgba(91,102,48,0.7)]" style={{ animation: "playhead 6s linear infinite" }}>
        <span className="absolute -left-[5px] -top-1 h-2.5 w-[11px] rounded-sm bg-lime" />
      </span>
    </div>
  );
}

function Bars() {
  const h = [0.35, 0.55, 0.4, 0.7, 0.5, 0.85, 0.6, 0.95, 0.75, 1];
  return (
    <div className="relative mt-auto h-36 rounded-2xl border border-line bg-paper p-3">
      <div className="label flex justify-between text-[9px] text-muted"><span>ease · expo.out</span><span className="text-lime">● keyframes</span></div>
      <div className="absolute inset-x-3 bottom-3 top-9 flex items-end gap-1.5">
        {h.map((v, i) => (
          <span key={i} className={`flex-1 origin-bottom rounded-t-md ${i === h.length - 1 ? "bg-lime" : "bg-fg/20"}`} style={{ height: "100%", ["--to" as string]: v, ["--from" as string]: v * 0.35, animation: `bar 2.6s ${i * 0.12}s ease-in-out infinite` }} />
        ))}
      </div>
      <svg className="absolute inset-x-3 bottom-3 top-9 h-[calc(100%-48px)] w-[calc(100%-24px)]" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden>
        <path d="M0 45 C 30 44, 45 40, 60 22 S 85 4, 100 3" fill="none" stroke="currentColor" className="text-lime" strokeWidth="1.2" strokeDasharray="160" strokeDashoffset="160" style={{ animation: "dash 3s ease-out infinite alternate" }} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-paper p-3">
      <div className="label mb-3 flex items-center justify-between text-[9px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-lime" style={{ animation: "blink 1s steps(2) infinite" }} /> HOST · CAM A</span>
        <span>−14 LUFS</span>
      </div>
      <div className="flex h-16 items-center gap-[3px]">
        {Array.from({ length: 44 }).map((_, i) => (
          <span key={i} className={`flex-1 rounded-full ${i > 14 && i < 28 ? "bg-lime" : "bg-fg/30"}`} style={{ height: `${30 + ((i * 53) % 70)}%`, animation: `wave ${0.9 + ((i * 7) % 5) * 0.15}s ${(i % 7) * 0.08}s ease-in-out infinite` }} />
        ))}
      </div>
      <div className="mt-3 flex gap-1.5">
        <span className="label rounded-md bg-lime px-2 py-1 text-[9px] text-bg">CUT</span>
        <span className="label rounded-md border border-line px-2 py-1 text-[9px] text-fg/60">J-CUT</span>
        <span className="label rounded-md border border-line px-2 py-1 text-[9px] text-fg/60">B-ROLL</span>
      </div>
    </div>
  );
}

function Captions() {
  const words = ["stop", "scrolling", "— this", "part", "matters."];
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-44 w-28 overflow-hidden rounded-[18px] border border-fg/20 bg-gradient-to-b from-[#2a2621] to-[#171512] shadow-[0_20px_40px_-20px_rgba(40,30,20,0.5)] p-2">
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-white/25" />
        <div className="absolute inset-x-2 bottom-8 flex flex-wrap justify-center gap-1">
          {words.map((w, i) => (
            <span key={i} className={`rounded-md px-1.5 py-0.5 text-[11px] font-extrabold uppercase tracking-tight ${i === 4 ? "bg-accentsoft text-fg" : "bg-white/15 text-white"}`} style={{ animation: `chip 4s ${i * 0.35}s ease-out infinite both` }}>
              {w}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-2 bottom-2 h-0.5 rounded bg-white/15"><span className="block h-full w-2/3 rounded bg-accentsoft" /></div>
      </div>
      <div className="ml-3 flex flex-col justify-center gap-1.5">
        {["9:16", "1:1", "4:5"].map((r, i) => <span key={r} className={`label rounded-md border px-2 py-1 text-[9px] ${i === 0 ? "border-lime text-lime" : "border-line text-fg/50"}`}>{r}</span>)}
      </div>
    </div>
  );
}

function StoryArc() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-paper p-3">
      <svg viewBox="0 0 200 60" className="h-16 w-full" aria-hidden>
        <path d="M5 52 C 50 50, 60 40, 90 30 S 140 2, 160 8 S 185 40, 195 46" fill="none" stroke="currentColor" className="text-fg/15" strokeWidth="1.5" />
        <path d="M5 52 C 50 50, 60 40, 90 30 S 140 2, 160 8 S 185 40, 195 46" fill="none" stroke="currentColor" className="text-lime" strokeWidth="2" strokeDasharray="260" strokeDashoffset="260" style={{ animation: "dash 3.5s ease-in-out infinite alternate" }} />
        <circle cx="160" cy="8" r="3.5" fill="currentColor" className="text-lime" />
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {["ACT I · hook", "ACT II · tension", "ACT III · payoff"].map((a, i) => (
          <div key={a} className={`rounded-lg border p-2 ${i === 2 ? "border-lime/50 bg-lime/10" : "border-line bg-fg/[0.02]"}`}>
            <div className="mb-1.5 aspect-video rounded bg-gradient-to-br from-fg/15 to-transparent" />
            <div className="label text-[8px] text-fg/60">{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flow() {
  const nodes = ["Brief", "Script", "Storyboard", "Edit", "Motion", "Deliver"];
  return (
    <div className="mt-auto overflow-hidden rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-center">
        {nodes.map((n, i) => (
          <div key={n} className="flex flex-1 items-center last:flex-none">
            <span className={`label shrink-0 rounded-full border px-2.5 py-1.5 text-[9px] md:px-3 md:text-[10px] ${i === 3 ? "border-lime bg-lime text-bg" : "border-line text-fg/70"}`}>{n}</span>
            {i < nodes.length - 1 && (
              <svg className="mx-1 h-2 flex-1" viewBox="0 0 40 2" preserveAspectRatio="none" aria-hidden>
                <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" className="text-lime" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="3 3" style={{ animation: "dash 1s linear infinite", strokeDashoffset: 6 }} />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["AI rough-cut assist", "auto-transcripts", "voice cleanup", "moodboards"].map((c) => (
          <span key={c} className="label rounded-md border border-dashed border-lime/40 px-2 py-1 text-[9px] text-lime/90">✦ {c}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- card with hover tilt ---------------- */
function Card({ className = "", shape, title, body, tag, children, fixed = false }: { className?: string; shape: keyof typeof SHAPES; title: string; body: string; tag: string; children: React.ReactNode; fixed?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.style.setProperty("--rx", `${18 - y * 30}deg`);
    ref.current!.style.setProperty("--ry", `${-24 + x * 50}deg`);
    ref.current!.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    ref.current!.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    ref.current!.style.transform = `perspective(1200px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
  };
  const leave = () => {
    ref.current!.style.removeProperty("--rx");
    ref.current!.style.removeProperty("--ry");
    ref.current!.style.transform = "";
  };
  return (
    // Outer div is animated by the scroll reveal; the inner card only gets the hover tilt,
    // so the two transforms never fight over the same element.
    <div className={`flex ${className}`}>
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className="card group relative flex min-h-[380px] w-full flex-col overflow-hidden p-6 transition-transform duration-300 ease-out md:p-7 [&:hover_.icon3d]:[animation-play-state:paused]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(500px circle at var(--mx,50%) var(--my,50%), rgba(91,102,48,0.08), transparent 45%)" }} />
      <div className="relative flex items-start justify-between">
        <Icon3D shape={shape} />
        <span className="label text-muted">{tag}</span>
      </div>
      <h3 className="relative mt-6 text-2xl font-bold tracking-tight md:text-[28px]">{title}</h3>
      <p className="relative mb-6 mt-2 max-w-md text-[15px] leading-relaxed text-fg/60 md:min-h-[3.3em]">{body}</p>
      <div className={`relative mt-auto flex flex-col ${fixed ? "h-[210px]" : ""}`}>{children}</div>
    </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative py-24 md:py-36">
      <div className="pointer-events-none absolute left-1/2 top-40 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-lime/[0.05] blur-[120px]" />
      <div className="wrap relative">
        <SectionHead index="03" label="What I do" lines={["One editor.", { text: "Every format.", className: "text-fg/35" }]} aside={<p>Edit, motion and story handled by the same pair of hands — so the cut and the graphics are designed together, not stitched on later.</p>} />
        <Reveal className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-6 md:gap-5">
          <Card className="md:col-span-4" shape="cut" tag="EDIT" title="Video editing" body="Pacing, structure and sound — long-form or short, I cut so the point lands early and the story holds to the last frame.">
            <Timeline />
          </Card>
          <Card className="md:col-span-2" shape="motion" tag="MOTION" title="Motion & UI animation" body="SaaS walkthroughs and product stories brought to life with clean, purposeful movement.">
            <Bars />
          </Card>
          <Card fixed className="md:col-span-2" shape="wave" tag="TALK" title="Podcasts & talking heads" body="Tight cuts, clean audio and B-roll that keeps a single voice watchable.">
            <Waveform />
          </Card>
          <Card fixed className="md:col-span-2" shape="reel" tag="SHORTS" title="Reels & short-form" body="Hooks in the first second, kinetic captions, built natively for each feed.">
            <Captions />
          </Card>
          <Card fixed className="md:col-span-2" shape="doc" tag="STORY" title="Documentary storytelling" body="Real moments shaped into an arc with a beginning, a turn and a payoff.">
            <StoryArc />
          </Card>
          <Card className="md:col-span-6 md:min-h-[300px]" shape="spark" tag="DIRECTION" title="Creative direction & AI-assisted workflows" body="From brief to final export — I plan the story, lead the look, and use AI tools where they save time without flattening the craft.">
            <Flow />
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
