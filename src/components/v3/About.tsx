"use client";
import { gsap, EASE, reducedMotion, ScrollTrigger } from "@/lib/gsap";
import type { Job, Settings } from "@/content/site";
import { useGsap } from "./useGsap";
import SectionLabel from "./SectionLabel";

const YEARS = ["2023", "2024", "2025", "2026"];

/**
 * SC17: no pin (a pin stops the scroll dead, which read as a jerk). The left column is sticky; the timeline
 * scrolls past it. Scroll drives the year roll, the line drawing down and each job settling in, both ways.
 */
export default function About({ settings, journey }: { settings: Settings; journey: Job[] }) {
  const jobs = [...journey].reverse(); // oldest first

  const ref = useGsap<HTMLElement>((el, q) => {
    if (reducedMotion()) return;
    const list = q(".ab-list")[0];
    // the column eases in as the section arrives, instead of popping
    gsap.fromTo(q(".ab-intro > *"), { y: 50, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, ease: EASE.settle, stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 85%", end: "top 35%", scrub: 0.6 },
    });
    const run = { trigger: list, start: "top 65%", end: "bottom 65%", scrub: 0.6 };
    gsap.fromTo(q(".ab-line"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: run });
    // scroll picks the year; each change rolls like a reel (never moves the page)
    const years = q(".ab-years")[0];
    let cur = 0;
    ScrollTrigger.create({
      ...run,
      onUpdate: (s) => {
        const idx = Math.min(YEARS.length - 1, Math.floor(s.progress * YEARS.length * 0.999 + 0.0001));
        if (idx === cur) return;
        cur = idx;
        gsap.to(years, { yPercent: (-100 / YEARS.length) * idx, duration: 0.6, ease: EASE.snap, overwrite: true });
      },
    });
    q(".ab-job").forEach((it) => {
      gsap.fromTo(it, { y: 40, autoAlpha: 0.15 }, { y: 0, autoAlpha: 1, ease: EASE.settle, scrollTrigger: { trigger: it, start: "top 85%", end: "top 55%", scrub: 0.6 } });
    });
  });

  return (
    <section ref={ref} id="about" className="relative bg-cream py-24 md:py-40">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="ab-intro md:sticky md:top-28 md:col-span-5 md:self-start">
          <SectionLabel sc="17" time="00:40" className="mb-6" />
          <h2 className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.045em]">Cut to</h2>
          <div className="relative mt-2 h-[1em] overflow-hidden font-display text-[clamp(5rem,13vw,12rem)] font-bold leading-none tracking-[-0.06em] text-saffron-dp" aria-label="2023 to 2026">
            <div className="ab-years" aria-hidden>
              {YEARS.map((y) => <div key={y} className="tnum h-[1em]">{y}</div>)}
            </div>
          </div>
          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-espresso/75">
            Self-taught. I started with thumbnails and layouts, then spent two and a half years at a Prayagraj media house shooting and cutting whatever had to go out that day. Now I make software easy to understand at {settings.currentCompany}.
          </p>
          <p className="mt-5 max-w-md font-display text-[22px] font-bold leading-snug tracking-[-0.02em]">The viewer gets the point in the first few seconds, and nothing on screen moves without a reason.</p>
        </div>
        <div className="relative md:col-span-7 md:pl-10 md:pt-[22vh]">
          <div className="ab-list relative pl-8 md:pb-[24vh]">
            <span className="ab-line absolute bottom-0 left-0 top-0 w-0.5 origin-top bg-espresso" />
            <ul className="space-y-14 md:space-y-[22vh]">
              {jobs.map((j) => (
                <li key={j.company} className="ab-job relative">
                  <span className="absolute -left-[37px] top-2 block h-3 w-3 rotate-45 bg-saffron" />
                  <p className="tnum text-[14px] text-cocoa">{j.period}{j.place ? `, ${j.place}` : ""}</p>
                  <h3 className="mt-1 font-display text-[26px] font-bold tracking-[-0.03em] md:text-[34px]">
                    {j.role} <span className="text-cocoa">at {j.company}</span>
                  </h3>
                  <p className="mt-2 max-w-lg text-[16px] leading-relaxed text-espresso/70 md:text-[17px]">{j.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
