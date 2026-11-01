"use client";
import { useEffect, useRef } from "react";
import { gsap, EASE, reducedMotion } from "@/lib/gsap";

/** SC08: "SC01  00:00" timecode label. Digits roll into place, the keyframe diamond pops. */
export default function SectionLabel({ sc, time, on = "scroll", className = "" }: { sc: string; time: string; on?: "scroll" | "intro"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const text = `SC${sc}  ${time}`;

  useEffect(() => {
    const el = ref.current!;
    const q = gsap.utils.selector(el);
    const reduce = reducedMotion();
    gsap.set(q(".sl-c"), { yPercent: reduce ? 0 : 100 });
    gsap.set(q(".sl-d"), { scale: reduce ? 1 : 0 });
    gsap.set(el, { autoAlpha: 1 });
    const play = () => {
      if (reduce) return;
      gsap.to(q(".sl-d"), { scale: 1, duration: 0.4, ease: EASE.pop });
      gsap.to(q(".sl-c"), { yPercent: 0, duration: 0.6, ease: EASE.settle, stagger: 0.03, delay: 0.05 });
    };
    if (on === "intro") {
      const f = () => gsap.delayedCall(0.1, play);
      window.addEventListener("intro:done", f, { once: true });
      return () => window.removeEventListener("intro:done", f);
    }
    const st = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", once: true }, onStart: play });
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, [on]);

  return (
    <div ref={ref} className={`intro-hide tnum flex items-center gap-2.5 font-mono text-[12px] tracking-[0.06em] text-cocoa ${className}`} aria-hidden>
      <span className="sl-d block h-2 w-2 rotate-45 bg-saffron" />
      <span className="flex">
        {text.split("").map((c, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <span className="sl-c inline-block whitespace-pre">{c}</span>
          </span>
        ))}
      </span>
    </div>
  );
}
