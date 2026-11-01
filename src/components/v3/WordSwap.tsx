"use client";
import { useEffect, useRef } from "react";
import { gsap, EASE, reducedMotion } from "@/lib/gsap";

/** SC03: a saffron playhead sweeps the word; it cuts to the next word as it passes. Holds 2.2 s, loops. */
export default function WordSwap({ words }: { words: string[] }) {
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = box.current!;
    const ws = [...el.querySelectorAll<HTMLElement>(".ws-word")];
    const chars = ws.map((w) => [...w.querySelectorAll<HTMLElement>(".ch")]);
    const ph = el.querySelector<HTMLElement>(".ws-ph")!;
    const reduce = reducedMotion();
    let widths: number[] = [];
    let i = 0;
    let visible = true;
    let call: gsap.core.Tween | null = null;
    let tl: gsap.core.Timeline | null = null;

    ws.forEach((_, j) => j && gsap.set(chars[j], { yPercent: 110 }));
    gsap.set(ph, { autoAlpha: 0, scaleY: 0, transformOrigin: "50% 50%" });
    const measure = () => { widths = ws.map((w) => w.offsetWidth); gsap.set(el, { width: widths[i] }); };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);

    const schedule = () => { call = gsap.delayedCall(2.2, () => (visible && !document.hidden ? next() : schedule())); };
    const next = () => {
      const j = (i + 1) % ws.length;
      if (reduce) {
        gsap.set(chars[i], { yPercent: 110 }); gsap.set(chars[j], { yPercent: 0 }); gsap.set(el, { width: widths[j] });
        i = j; schedule(); return;
      }
      const travel = Math.max(widths[i], widths[j]) - 3;
      tl = gsap.timeline({ onComplete: () => { i = j; schedule(); } });
      tl.set(ph, { x: 0, autoAlpha: 1, scaleY: 0 })
        .to(ph, { scaleY: 1, duration: 0.18, ease: EASE.pop })
        .to(ph, { x: travel, duration: 0.55, ease: EASE.wipe }, 0.08)
        .to(chars[i], { yPercent: -110, duration: 0.35, ease: EASE.wipe, stagger: 0.02 }, 0.14)
        .fromTo(chars[j], { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: EASE.snap, stagger: 0.02 }, 0.26)
        .to(el, { width: widths[j], duration: 0.6, ease: EASE.settle }, 0.2)
        .to(ph, { scaleY: 0, duration: 0.22, ease: EASE.wipe }, 0.7)
        .set(ph, { autoAlpha: 0 });
    };
    const start = () => schedule();
    window.addEventListener("hero:in", start, { once: true });

    return () => {
      window.removeEventListener("hero:in", start);
      window.removeEventListener("resize", measure);
      io.disconnect(); call?.kill(); tl?.kill();
    };
  }, []);

  return (
    <span ref={box} className="relative inline-block h-[1.12em] overflow-hidden align-top" style={{ marginBottom: "-0.14em" }}>
      {words.map((w, k) => (
        <span key={w} className="ws-word absolute left-0 top-0 whitespace-nowrap" aria-hidden={k > 0}>
          {w.split("").map((c, j) => (
            <span key={j} className={`ch inline-block ${k === 0 ? "reveal" : ""}`}>{c}</span>
          ))}
        </span>
      ))}
      <span className="ws-ph absolute left-0 top-[0.08em] h-[0.9em] w-[3px] rounded-full bg-saffron" aria-hidden />
    </span>
  );
}
