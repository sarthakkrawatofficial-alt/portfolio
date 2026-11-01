"use client";
import { gsap, EASE, reducedMotion, ScrollTrigger } from "@/lib/gsap";
import type { Stat } from "@/content/site";
import { useGsap } from "./useGsap";
import SectionLabel from "./SectionLabel";

const DIGITS = Array.from({ length: 20 }, (_, i) => i % 10); // two turns of the reel

/** SC11: each digit is its own slot reel that spins one turn and lands. Client marquee leans with scroll speed. */
export default function Stats({ stats, clients }: { stats: Stat[]; clients: string[] }) {
  const ref = useGsap<HTMLElement>((el, q) => {
    const reduce = reducedMotion();
    // reels
    q(".reel").forEach((r) => {
      const d = Number(r.dataset.d);
      if (reduce) { gsap.set(r, { yPercent: -(10 + d) * 5 }); return; }
      gsap.set(r, { yPercent: 0 });
    });
    if (!reduce) {
      ScrollTrigger.create({
        trigger: q(".stats")[0], start: "top 80%", once: true,
        onEnter: () => q(".reel").forEach((r, i) => {
          gsap.to(r, { yPercent: -(10 + Number(r.dataset.d)) * 5, duration: 1.4, ease: EASE.snap, delay: i * 0.08 });
        }),
      });
    }
    // marquee
    const track = q(".mq")[0];
    const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    if (reduce) { loop.pause(); return; }
    const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: EASE.settle });
    let rest: gsap.core.Tween | null = null;
    ScrollTrigger.create({
      trigger: el, start: "top bottom", end: "bottom top",
      onUpdate: (s) => {
        const v = s.getVelocity();
        skew(gsap.utils.clamp(-2.5, 2.5, v / -600));
        loop.timeScale(1 + Math.min(3, Math.abs(v) / 800));
        // settle back once the scroll stops
        rest?.kill();
        rest = gsap.delayedCall(0.15, () => { skew(0); gsap.to(loop, { timeScale: 1, duration: 0.6, ease: EASE.settle }); });
      },
    });
  });

  const list = [...clients, ...clients];
  return (
    <section ref={ref} className="relative bg-cream py-24 md:py-32">
      <div className="wrap">
        <SectionLabel sc="11" time="00:24" className="mb-10 md:mb-14" />
        <div className="stats grid grid-cols-2 gap-y-12 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className={`${i % 2 ? "pl-5 md:pl-8" : ""} ${i ? "md:border-l md:border-espresso/10 md:pl-8" : ""} ${i % 2 ? "border-l border-espresso/10" : ""}`}>
              <div className="flex items-start font-display text-[clamp(3.6rem,8vw,7rem)] font-bold leading-none tracking-[-0.05em]" aria-label={`${s.value}${s.suffix}`}>
                {String(s.value).split("").map((ch, j) => (
                  <span key={j} className="relative inline-block h-[1em] overflow-hidden" aria-hidden>
                    <span className="reel block" data-d={ch}>
                      {DIGITS.map((d, k) => <span key={k} className="block h-[1em]">{d}</span>)}
                    </span>
                  </span>
                ))}
                {s.suffix && <span className="text-saffron">{s.suffix}</span>}
              </div>
              <p className="mt-3 text-[15px] text-cocoa md:text-[17px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-20 overflow-hidden border-y border-espresso/10 py-6 md:mt-28 md:py-8" aria-label="Clients">
        <div className="mq flex w-max">
          {list.map((c, i) => (
            <span key={i} className={`flex shrink-0 items-center whitespace-nowrap pr-10 font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold tracking-[-0.03em] md:pr-14 ${i % 2 ? "text-cocoa" : "text-espresso"}`}>
              {c}
              <span className="ml-10 block h-2.5 w-2.5 rotate-45 bg-saffron md:ml-14" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
