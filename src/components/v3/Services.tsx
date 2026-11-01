"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, EASE, reducedMotion, finePointer, ScrollTrigger } from "@/lib/gsap";
import { useGsap } from "./useGsap";
import SectionLabel from "./SectionLabel";

// [title, text, aspect label, aspect w/h, typical length]
const SERVICES: [string, string, string, number, string][] = [
  ["SaaS and product films", "UI walkthroughs, feature explainers and launch films. The interface is rebuilt in After Effects so it moves the way the story needs.", "16:9", 16 / 9, "30 to 90 s"],
  ["Explainers and talking heads", "Long-form with a presenter: chapter cards, on-screen diagrams and B-roll that follow the script line by line.", "4:3", 4 / 3, "2 to 10 min"],
  ["Reels and shorts", "Vertical cuts with captions and graphics designed for 9:16 from the start, not cropped from the wide version.", "9:16", 9 / 16, "Under 60 s"],
  ["Trailers and promos", "Podcast trailers, event and tour promos. Hook first, then the pitch.", "2.39:1", 2.39, "30 to 90 s"],
  ["Documentary edits", "Interviews and archive shaped into a story with a beginning, a turn and a payoff.", "1.85:1", 1.85, "5 min and up"],
];

/** clip-path inset that leaves a box of the given aspect centred in a square */
const inset = (a: number) => {
  const w = a >= 1 ? 100 : a * 100, h = a >= 1 ? 100 / a : 100;
  return `inset(${(100 - h) / 2}% ${(100 - w) / 2}% ${(100 - h) / 2}% ${(100 - w) / 2}% round 18px)`;
};

/** SC16: one frame changes shape to each service's format (hover on desktop, scroll position on phones). */
export default function Services() {
  const [active, setActive] = useState(0);
  const frame = useRef<HTMLDivElement>(null);

  const ref = useGsap<HTMLElement>((el, q) => {
    q(".sv-item").forEach((item, i) => {
      ScrollTrigger.create({ trigger: item, start: "top 60%", end: "bottom 60%", onToggle: (s) => { if (s.isActive && !finePointer()) setActive(i); } });
      if (!reducedMotion()) gsap.fromTo(item, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: EASE.settle, scrollTrigger: { trigger: item, start: "top 88%", once: true } });
    });
  });

  useEffect(() => {
    const a = SERVICES[active][3];
    const q = gsap.utils.selector(frame.current);
    gsap.to(q(".sv-clip"), { clipPath: inset(a), duration: reducedMotion() ? 0 : 0.7, ease: EASE.snap });
    gsap.fromTo(q(".sv-label"), { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: EASE.settle });
    if (!reducedMotion()) {
      gsap.fromTo(q(".sv-ratio, .sv-len"), { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: EASE.settle, stagger: 0.05, delay: 0.15 });
      gsap.fromTo(q(".sv-ph"), { scaleX: 0 }, { scaleX: 3.33, duration: 1.6, ease: EASE.wipe });
    }
  }, [active]);

  return (
    <section ref={ref} id="services" className="relative bg-cream py-24 md:py-36">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="order-1 md:order-none md:col-span-7">
          <SectionLabel sc="16" time="00:34" className="mb-6" />
          <h2 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.045em]">What you can hire me for</h2>
          <ul className="mt-10 border-t border-espresso/10 md:mt-14">
            {SERVICES.map(([t, d, ar], i) => (
              <li
                key={t}
                className={`sv-item cursor-default border-b border-espresso/10 py-6 transition-colors duration-300 md:py-7 ${active === i ? "text-espresso" : "text-espresso/45"}`}
                onPointerEnter={() => finePointer() && setActive(i)}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[24px] font-bold tracking-[-0.03em] md:text-[32px]">{t}</h3>
                  <span className="tnum font-mono text-[12px] text-cocoa">{ar}</span>
                </div>
                <p className={`mt-2 max-w-xl text-[16px] leading-relaxed transition-opacity duration-300 ${active === i ? "opacity-100" : "opacity-70"}`}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
        {/* phones: the frame rides above the list so its shape change stays in view */}
        <div className="sticky top-16 z-10 -mx-4 order-first bg-cream/95 px-4 pb-10 pt-3 md:static md:order-none md:mx-0 md:bg-transparent md:p-0 md:col-span-5">
          <div ref={frame} className="relative mx-auto aspect-square w-[46vw] max-w-[460px] md:sticky md:top-28 md:w-full">
            {/* an editor's frame guide: the shape is the deliverable's aspect ratio */}
            <div className="sv-clip absolute inset-0 bg-espresso" style={{ clipPath: inset(16 / 9) }}>
              <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(239,228,207,1)_1px,transparent_1px),linear-gradient(90deg,rgba(239,228,207,1)_1px,transparent_1px)] [background-size:33.333%_33.333%]" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-cream/15" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-cream/15" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="sv-ratio tnum font-display text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.04em] text-cream">{SERVICES[active][2]}</div>
                  <div className="sv-len mt-2 text-[15px] text-cream/60">{SERVICES[active][4]}</div>
                </div>
              </div>
              {/* playhead running across the bottom of the frame */}
              <div className="absolute inset-x-0 bottom-[22%] h-[3px] bg-cream/10">
                <span className="sv-ph absolute inset-y-0 left-0 w-[30%] origin-left bg-saffron" />
              </div>
            </div>
            <div className="absolute -bottom-9 left-0 overflow-hidden">
              <div className="sv-label flex items-center gap-2 text-[14px] text-cocoa">
                <span className="block h-2 w-2 rotate-45 bg-saffron" />
                {SERVICES[active][0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
