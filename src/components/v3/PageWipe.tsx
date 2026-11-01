"use client";
import { useEffect, useRef } from "react";
import { gsap, EASE, reducedMotion } from "@/lib/gsap";

const p2 = (n: number) => String(n).padStart(2, "0");

/**
 * SC23: links marked data-transition leave through an espresso wipe with a saffron leading edge;
 * the page name and a timecode flash before the browser moves on. Pages that mount this with
 * `enter` wipe the panel off on arrival, so every page change reads as one continuous edit.
 */
export default function PageWipe({ enter = false }: { enter?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const reduce = reducedMotion();
    if (enter) {
      gsap.set(el, { yPercent: 0, autoAlpha: 1 });
      gsap.to(el, { yPercent: -100, duration: reduce ? 0 : 0.6, ease: EASE.wipe, delay: 0.05, onComplete: () => gsap.set(el, { autoAlpha: 0 }) });
    } else gsap.set(el, { autoAlpha: 0 });

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[data-transition]") as HTMLAnchorElement | null;
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      e.preventDefault();
      const go = () => { window.location.href = a.href; };
      if (reduce) return go();
      label.current!.textContent = a.dataset.label || a.textContent?.trim() || "";
      const f = Math.floor(Math.random() * 25);
      tc.current!.textContent = `00:00:${p2(Math.floor(window.scrollY / 400) % 60)}:${p2(f)}`;
      gsap.timeline({ onComplete: go })
        .set(el, { autoAlpha: 1, yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.6, ease: EASE.wipe })
        .fromTo([label.current, tc.current], { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: EASE.settle, stagger: 0.05 }, 0.3)
        .to({}, { duration: 0.15 });
    };
    // restore when the browser brings the page back from its cache
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) gsap.set(el, { autoAlpha: 0 }); };
    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    return () => { document.removeEventListener("click", onClick); window.removeEventListener("pageshow", onShow); };
  }, [enter]);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[320] grid place-items-center bg-espresso" style={{ visibility: enter ? "visible" : "hidden" }}>
      <div className="absolute inset-x-0 top-0 h-[5px] bg-saffron" />
      <div className="text-center">
        <div className="overflow-hidden"><div ref={label} className="font-display text-[clamp(2.6rem,7vw,6rem)] font-bold tracking-[-0.045em] text-cream" /></div>
        <div className="mt-3 overflow-hidden"><div ref={tc} className="tnum font-mono text-[12px] tracking-[0.08em] text-cream/55" /></div>
      </div>
    </div>
  );
}
