"use client";
import { useRef } from "react";
import { asset } from "@/lib/asset";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import SectionHead from "./SectionHead";

const STEPS = [
  { n: "01", t: "Listen & map the story", d: "Before the timeline opens: who is watching, what they should feel, and the one thing they should remember. That becomes the spine of the edit." },
  { n: "02", t: "Cut first, then move", d: "A rough cut that works with zero effects. Only then come motion, captions, sound design and grade — each one earning its place." },
  { n: "03", t: "Polish & ship everywhere", d: "Timestamped review rounds, final mix and grade, then exports re-framed and re-paced for every platform the video is headed to." },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const set = (v: number) => { frame.current!.style.setProperty("--split", `${v * 100}%`); };
      const o = { v: 0.9 };
      gsap.to(o, {
        v: 0.1, ease: "none",
        scrollTrigger: { trigger: frame.current, start: "top 85%", end: "center 30%", scrub: 0.6 },
        onUpdate: () => set(o.v),
      });
      gsap.from(".step-card", { y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".step-grid", start: "top 85%" } });
      gsap.fromTo(".step-line", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".step-grid", start: "top 80%", end: "bottom 60%", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  const drag = (e: React.PointerEvent) => {
    const el = frame.current!;
    const r = el.getBoundingClientRect();
    const upd = (x: number) => el.style.setProperty("--split", `${Math.min(98, Math.max(2, ((x - r.left) / r.width) * 100))}%`);
    upd(e.clientX);
    const move = (ev: PointerEvent) => upd(ev.clientX);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <section ref={root} id="process" className="relative py-24 md:py-36">
      <div className="wrap">
        <SectionHead index="04" label="Process" lines={["From raw", { text: "to remembered.", className: "text-lime" }]} aside={<p>Three steps, every time. Scroll — or drag the handle — to see what happens between the raw file and the final cut.</p>} />

        <div ref={frame} onPointerDown={drag} data-cursor="drag" className="relative mt-12 aspect-[4/5] w-full touch-pan-y select-none overflow-hidden rounded-[28px] border border-line bg-black sm:aspect-[16/8] md:mt-16" style={{ ["--split" as string]: "90%" }}>
          {/* AFTER (full) */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/photo.webp")} alt="" draggable={false} className="absolute inset-0 h-full w-full scale-[1.12] object-cover object-[50%_30%] [filter:grayscale(1)_contrast(1.35)_brightness(1.05)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_30%,rgba(0,0,0,0.65)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-[7%] bg-black" />
            <div className="absolute inset-x-0 bottom-0 h-[7%] bg-black" />
            <div className="absolute bottom-[16%] left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-1.5 px-4">
              {["I", "think", "in"].map((w) => <span key={w} className="rounded-lg bg-black/80 px-2 py-1 text-lg font-extrabold uppercase tracking-tight md:text-3xl">{w}</span>)}
              <span className="rounded-lg bg-lime px-2 py-1 text-lg font-extrabold uppercase tracking-tight text-bg md:text-3xl">stories</span>
            </div>
            <div className="absolute left-[5%] top-[13%] hidden items-center gap-3 rounded-xl border border-fg/15 bg-black/60 py-2 pl-2 pr-4 backdrop-blur md:flex">
              <span className="h-8 w-1 rounded bg-lime" />
              <div><div className="text-sm font-bold">Sarthak Rawat</div><div className="label text-[9px] text-fg/60">Visual storyteller</div></div>
            </div>
            <div className="label absolute right-4 top-[10%] rounded-full bg-lime px-3 py-1.5 text-[10px] font-bold text-bg md:right-6">AFTER · GRADED</div>
          </div>

          {/* BEFORE (clipped) */}
          <div className="absolute inset-0" style={{ clipPath: "inset(0 calc(100% - var(--split)) 0 0)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/photo.webp")} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover object-[50%_30%] [filter:saturate(0.15)_contrast(0.55)_brightness(1.35)_blur(0.4px)]" />
            {/* raw overlays: thirds grid, timecode, scopes */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => <span key={i} className="border border-white/10" />)}
            </div>
            <div className="label absolute left-4 top-[10%] rounded-full bg-black/70 px-3 py-1.5 text-[10px] text-fg/80 md:left-6">BEFORE · RAW LOG</div>
            <div className="label absolute bottom-6 left-4 text-[10px] text-fg/70 md:left-6">A001_C014 · 00:12:48:03 · UNGRADED</div>
            <div className="absolute bottom-14 left-4 hidden h-16 w-36 items-end gap-[2px] rounded-md bg-black/60 p-1.5 md:left-6 md:flex">
              {Array.from({ length: 30 }).map((_, i) => <span key={i} className="flex-1 bg-fg/40" style={{ height: `${35 + Math.sin(i / 3) * 12 + ((i * 13) % 9)}%` }} />)}
            </div>
          </div>

          {/* handle */}
          <div className="pointer-events-none absolute inset-y-0" style={{ left: "var(--split)" }}>
            <div className="absolute inset-y-0 -left-px w-0.5 bg-lime shadow-[0_0_20px_2px_rgba(200,255,46,0.6)]" />
            <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime text-bg shadow-[0_0_40px_rgba(200,255,46,0.6)]">
              <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden><path d="M6 1L1 6l5 5M16 1l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
            </div>
          </div>
        </div>

        <div className="step-grid relative mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
          <div className="absolute left-0 right-0 top-0 hidden h-px bg-line md:block"><div className="step-line h-full origin-left bg-lime" /></div>
          {STEPS.map((s) => (
            <div key={s.n} className="step-card card relative p-6 md:mt-8 md:p-8">
              <div className="flex items-center justify-between">
                <span className="text-6xl font-extrabold tracking-[-0.06em] text-lime md:text-7xl">{s.n}</span>
                <span className="label text-muted">Step</span>
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-tight">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-fg/60">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
