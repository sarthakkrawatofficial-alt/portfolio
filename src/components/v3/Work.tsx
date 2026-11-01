"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, EASE, reducedMotion, finePointer, isMobile, ScrollTrigger } from "@/lib/gsap";
import { CATEGORIES, THUMB_FALLBACK, ytEmbed, ytThumb, type Project } from "@/content/site";
import { usePlayer } from "./Player";
import { useGsap } from "./useGsap";
import SectionLabel from "./SectionLabel";
import Split from "./Split";

const roleText = (r: string) => r.replace(/\s*·\s*/g, ", ");

function Thumb({ p }: { p: Project }) {
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(s + 1, THUMB_FALLBACK.length - 1));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ytThumb(p.youtubeId, THUMB_FALLBACK[step])}
      onError={next}
      onLoad={(e) => { if ((e.currentTarget as HTMLImageElement).naturalWidth <= 120) next(); }}
      alt={`${p.title}, ${p.client}`}
      loading="lazy"
      decoding="async"
      className="w-thumb absolute inset-0 h-[112%] w-full -translate-y-[6%] object-cover"
    />
  );
}

/** SC12-14: cards rise in with a clip reveal; hover morphs the preview frame and plays a silent preview; click grows the card into the player. */
function Card({ p, feature = false }: { p: Project; feature?: boolean }) {
  const open = usePlayer();
  const btn = useRef<HTMLButtonElement>(null);
  const media = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portrait = p.orientation === "portrait";

  const enter = () => {
    if (!finePointer() || reducedMotion()) return;
    gsap.to(btn.current, { scale: 1.02, duration: 0.5, ease: EASE.settle, overwrite: "auto" });
    gsap.to(media.current, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.5, ease: EASE.settle, overwrite: "auto" });
    t.current = setTimeout(() => setLive(true), 400);
  };
  const leave = () => {
    if (t.current) clearTimeout(t.current);
    setLive(false);
    gsap.to(btn.current, { scale: 1, duration: 0.5, ease: EASE.settle, overwrite: "auto" });
    gsap.to(media.current, { clipPath: "inset(3% 3% 3% 3% round 14px)", duration: 0.5, ease: EASE.settle, overwrite: "auto" });
  };

  return (
    <article className={`work-card group min-w-0 ${feature ? "md:col-span-2" : ""} ${portrait ? "w-[66vw] shrink-0 snap-start sm:w-[300px] md:w-[320px]" : ""}`}>
      <button
        ref={btn}
        type="button"
        data-cursor="play"
        onPointerEnter={enter}
        onPointerLeave={leave}
        onClick={() => open({ id: p.youtubeId, title: p.title, orientation: p.orientation, from: btn.current })}
        className={`relative block w-full overflow-hidden rounded-[20px] bg-espresso text-left ${portrait ? "aspect-[9/16]" : feature ? "aspect-video md:aspect-[21/9]" : "aspect-video"}`}
        aria-label={`Play ${p.title}, ${p.client.replace(/\s*·\s*/g, ", ")}`}
      >
        <span ref={media} className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(3% 3% 3% 3% round 14px)" }}>
          <Thumb p={p} />
          {live && (
            <iframe
              className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2"
              src={ytEmbed(p.youtubeId, { muted: true, controls: false, loop: true })}
              title={`${p.title} preview`}
              allow="autoplay; encrypted-media"
              tabIndex={-1}
            />
          )}
        </span>
        {!portrait && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/85 to-transparent p-5 pt-16 text-[15px] leading-relaxed text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:p-6">
            {p.description}
          </span>
        )}
      </button>
      <div className="mt-4 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <h3 className={`font-display font-bold leading-tight tracking-[-0.03em] ${portrait ? "text-[19px]" : "text-[22px] md:text-[26px]"}`}>{p.title}</h3>
          <p className="mt-1 text-[15px] text-cocoa">{p.client.replace(/\s*·\s*/g, ", ")}</p>
        </div>
        {!portrait && <p className="mt-1 hidden shrink-0 text-right text-[14px] text-cocoa md:block">{roleText(p.role)}</p>}
      </div>
    </article>
  );
}

export default function Work({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("All");
  const chips = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const cats = useMemo(() => ["All", ...CATEGORIES.filter((c) => projects.some((p) => p.category === c))], [projects]);
  const list = filter === "All" ? projects : projects.filter((p) => p.category === filter);
  const longs = list.filter((p) => p.orientation !== "portrait");
  const shorts = list.filter((p) => p.orientation === "portrait");
  const first = useRef(true);

  const ref = useGsap<HTMLElement>((el, q) => {
    if (reducedMotion()) return;
    const m = isMobile();
    gsap.set(q(".hd .ch"), { yPercent: 110 });
    ScrollTrigger.create({ trigger: q(".hd")[0], start: "top 85%", once: true, onEnter: () => gsap.to(q(".hd .ch"), { yPercent: 0, duration: 1.1, ease: EASE.settle, stagger: 0.025 }) });
    if (!m) q(".w-thumb").forEach((img) => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.closest("button"), start: "top bottom", end: "bottom top", scrub: true } }));
  });

  // the active filter's pill slides to it
  useEffect(() => {
    const b = chips.current?.querySelector<HTMLElement>(`[data-cat="${CSS.escape(filter)}"]`);
    if (!b || !pill.current) return;
    gsap.to(pill.current, { x: b.offsetLeft, width: b.offsetWidth, duration: first.current ? 0 : 0.5, ease: EASE.snap });
  }, [filter]);

  // cards: rise + clip reveal on first view, quick re-stagger after a filter change
  useEffect(() => {
    const cards = grid.current!.querySelectorAll<HTMLElement>(".work-card");
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      if (first.current) {
        gsap.set(cards, { y: 60, clipPath: "inset(100% 0% 0% 0%)" });
        ScrollTrigger.batch(cards, {
          start: "top 90%", once: true,
          onEnter: (b) => gsap.to(b, { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: EASE.settle, stagger: 0.06 }),
        });
      } else {
        gsap.fromTo(cards, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: EASE.settle, stagger: 0.04, onComplete: () => ScrollTrigger.refresh() });
      }
    }, grid);
    return () => ctx.revert();
  }, [filter]);

  const pick = (c: string) => { first.current = false; setFilter(c); };

  return (
    <section ref={ref} id="work" className="relative bg-cream py-24 md:py-36">
      <div className="wrap">
        <SectionLabel sc="12" time="00:26" className="mb-6 md:mb-8" />
        <div className="hd flex items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(3rem,8vw,7.5rem)] font-bold leading-[1.02] tracking-[-0.045em]" aria-label="Selected work">
            <span aria-hidden><Split text="Selected work" /></span>
          </h2>
        </div>

        <div ref={chips} className="relative mt-10 flex flex-wrap gap-2 md:mt-12" role="tablist" aria-label="Filter projects">
          <span ref={pill} aria-hidden className="pointer-events-none absolute left-0 top-0 hidden h-11 rounded-full bg-espresso md:block" />
          {cats.map((c) => {
            const n = c === "All" ? projects.length : projects.filter((p) => p.category === c).length;
            const on = filter === c;
            return (
              <button
                key={c}
                data-cat={c}
                role="tab"
                aria-selected={on}
                onClick={() => pick(c)}
                className={`relative z-10 flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] transition-colors duration-300 ${on ? "border-espresso bg-espresso text-cream md:bg-transparent" : "border-espresso/15 text-espresso/75 hover:text-espresso"}`}
              >
                {c}
                <span className={`tnum text-[13px] ${on ? "text-cream/60" : "text-cocoa"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        <div ref={grid} className="mt-12 space-y-16 md:mt-16 md:space-y-24">
          {longs.length > 0 && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2">
              {longs.map((p, i) => <Card key={p.id} p={p} feature={longs.length % 2 === 1 && i === 0} />)}
            </div>
          )}
          {shorts.length > 0 && (
            <div>
              <div className="mb-6 flex items-end justify-between gap-4">
                <h3 className="font-display text-[28px] font-bold tracking-[-0.03em] md:text-[34px]">Shorts and reels</h3>
                <div className="hidden gap-2 md:flex">
                  {[-1, 1].map((d) => (
                    <button key={d} onClick={() => rail.current?.scrollBy({ left: d * 680, behavior: "smooth" })} aria-label={d < 0 ? "Previous shorts" : "Next shorts"} className="grid h-12 w-12 place-items-center rounded-full border border-espresso/20 transition-colors hover:border-espresso hover:bg-espresso hover:text-cream">
                      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={d < 0 ? "rotate-180" : ""}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
                    </button>
                  ))}
                </div>
              </div>
              <div ref={rail} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:-mx-10 md:gap-6 md:px-10">
                {shorts.map((p) => <Card key={p.id} p={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
