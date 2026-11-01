"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, EASE, reducedMotion } from "@/lib/gsap";
import type { Testimonial } from "@/content/site";
import { asset } from "@/lib/asset";
import Panel from "./Panel";
import SectionLabel from "./SectionLabel";

const HOLD = 6;

/** SC19: one quote at a time; words rise out of masks, the highlight in saffron. Next every 6 s, on swipe or by avatar. */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const quote = useRef<HTMLQuoteElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const [auto, setAuto] = useState(true);
  const goTo = (n: number) => { setAuto(false); setI((n + items.length) % items.length); };
  const t = items[i];

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const words = quote.current!.querySelectorAll(".qw");
    const reduce = reducedMotion();
    if (!reduce) gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: EASE.settle, stagger: 0.015 });
    const p = gsap.fromTo(bar.current, { scaleX: 0 }, {
      scaleX: 1, duration: HOLD, ease: "none",
      onComplete: () => setI((n) => (n + 1) % items.length),
    });
    if (!auto) p.pause();
    const tick = setInterval(() => { if (!visible.current || document.hidden) p.pause(); else p.resume(); }, 300);
    return () => { p.kill(); clearInterval(tick); };
  }, [i, items.length, auto]);

  // swipe
  const start = useRef(0);
  const down = (e: React.PointerEvent) => { start.current = e.clientX; };
  const up = (e: React.PointerEvent) => {
    const dx = e.clientX - start.current;
    if (Math.abs(dx) > 50) goTo(i + (dx < 0 ? 1 : -1));
  };

  const parts = t.highlight && t.quote.includes(t.highlight) ? t.quote.split(t.highlight) : [t.quote];
  const words = (s: string, hl = false) =>
    s.split(" ").filter(Boolean).map((w, k) => (
      <span key={`${hl}${k}${w}`} className="mask"><span className={`qw ${hl ? "text-saffron-dp" : ""}`}>{w}&nbsp;</span></span>
    ));

  return (
    <Panel className="bg-cream-dp">
      <div ref={root} className="wrap py-24 md:py-36" onPointerDown={down} onPointerUp={up}>
        <SectionLabel sc="18" time="00:43" className="mb-10" />
        <blockquote ref={quote} key={i} className="max-w-5xl font-display text-[clamp(1.7rem,3.6vw,3.3rem)] font-bold leading-[1.12] tracking-[-0.03em]">
          {parts.length > 1 ? (<>{words(parts[0])}{words(t.highlight!, true)}{words(parts.slice(1).join(t.highlight))}</>) : words(t.quote)}
        </blockquote>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <div>
            <p className="text-[17px] font-medium">{t.name}</p>
            <p className="text-[15px] text-cocoa">{t.company}</p>
          </div>
        </div>
        <div className="mt-10 flex items-center gap-3">
          {items.map((x, k) => (
            <button key={x.name} onClick={() => goTo(k)} aria-label={`Quote from ${x.name}`} className={`relative h-12 w-12 overflow-hidden rounded-full border-2 transition-[border-color,transform] duration-300 ${k === i ? "scale-110 border-saffron" : "border-transparent opacity-60 hover:opacity-100"}`}>
              {x.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(x.avatar)} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center bg-espresso text-cream">{x.name[0]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-6 flex max-w-md items-center gap-4">
          <span className="tnum text-[14px] text-cocoa">{i + 1} of {items.length}</span>
          <div className="h-0.5 flex-1 bg-espresso/10">
            <span ref={bar} className="block h-full origin-left bg-espresso" />
          </div>
          {[-1, 1].map((d) => (
            <button key={d} onClick={() => goTo(i + d)} aria-label={d < 0 ? "Previous quote" : "Next quote"} className="grid h-11 w-11 place-items-center rounded-full border border-espresso/20 transition-colors hover:border-espresso hover:bg-espresso hover:text-cream">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={d < 0 ? "rotate-180" : ""}><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}
