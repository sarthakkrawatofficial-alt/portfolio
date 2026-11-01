"use client";
import { useEffect, useRef } from "react";
import { gsap, EASE, reducedMotion } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";

const KEY = "sr-intro-v3";
const FPS = 25;
const END = 37; // 00:00:01:12
const p2 = (n: number) => String(n).padStart(2, "0");
const tc = (f: number) => `00:00:${p2(Math.floor(f / FPS))}:${p2(f % FPS)}`;

/** SC01: timecode runs up, four keyframes slide in and become the S, the name rises, an espresso panel wipes up. */
export default function Preloader({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const first = name.split(" ")[0];

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const html = document.documentElement;
    let introSent = false;
    const done = () => { if (!introSent) { introSent = true; window.dispatchEvent(new Event("intro:done")); } };
    const finish = () => { el.style.display = "none"; html.style.overflow = ""; scrollState.lenis?.start(); };

    // read once in <head> before React runs, so a re-run of this effect can't flip it
    const seen = html.classList.contains("seen");
    try { localStorage.setItem(KEY, "1"); } catch {}
    html.style.overflow = "hidden";
    const lock = setTimeout(() => scrollState.lenis?.stop(), 0);

    // context: a re-run (React dev) reverts every tween and inline style first
    const ctx = gsap.context(() => {
      if (reducedMotion()) {
        gsap.to(el, { autoAlpha: 0, duration: 0.3, ease: "none", onStart: done, onComplete: finish });
        return;
      }
      if (seen) {
        gsap.set(q(".pl-inner"), { autoAlpha: 0 });
        gsap.to(el, { yPercent: -100, duration: 0.4, ease: EASE.wipe, delay: 0.05, onComplete: finish });
        gsap.delayedCall(0.25, done);
        return;
      }

      // where the four keyframes land: the centre of the S, measured when they start moving (fonts are in by then)
      const target = (axis: "x" | "y", k: Element) => {
        const s = q(".pl-s")[0].getBoundingClientRect();
        const b = k.getBoundingClientRect();
        const cur = Number(gsap.getProperty(k, axis));
        return axis === "x" ? cur + (s.left + s.width / 2) - (b.left + b.width / 2) : cur + (s.top + s.height * 0.55) - (b.top + b.height / 2);
      };
      const counter = { f: 0 };
      const tcEl = q(".pl-tc")[0];

      gsap.set(q(".pl-s"), { scale: 0.4, autoAlpha: 0 });
      gsap.set(q(".pl-l"), { yPercent: 110 });

      const tl = gsap.timeline({ onComplete: finish });
      tl.from(q(".pl-tc, .pl-track"), { autoAlpha: 0, y: 8, duration: 0.35, ease: EASE.settle, stagger: 0.05 }, 0)
        .to(counter, { f: END, duration: 1.1, ease: EASE.wipe, onUpdate: () => { tcEl.textContent = tc(Math.round(counter.f)); } }, 0.05)
        .from(q(".pl-key"), { x: (i) => [-150, -60, 60, 150][i], autoAlpha: 0, duration: 0.55, ease: EASE.snap, stagger: 0.05 }, 0.15)
        .to(q(".pl-key"), { x: (_i: number, k: Element) => target("x", k), y: (_i: number, k: Element) => target("y", k), scale: 0.4, duration: 0.4, ease: EASE.wipe, stagger: 0.03 }, 0.62)
        .to(q(".pl-key"), { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.98)
        .to(q(".pl-s"), { scale: 1, autoAlpha: 1, duration: 0.45, ease: EASE.pop }, 0.95)
        .to(q(".pl-l"), { yPercent: 0, duration: 0.7, ease: EASE.settle, stagger: 0.025 }, 1.0)
        .to(q(".pl-tc, .pl-track"), { autoAlpha: 0, duration: 0.2, ease: EASE.wipe }, 1.3)
        .to(q(".pl-inner"), { yPercent: -18, duration: 0.5, ease: EASE.wipe }, 1.38)
        .to(el, { yPercent: -100, duration: 0.5, ease: EASE.wipe }, 1.38)
        .add(done, 1.6);
    }, el);

    return () => { clearTimeout(lock); ctx.revert(); };
  }, []);

  return (
    <div ref={root} className="preloader fixed inset-0 z-[300] bg-espresso text-cream" aria-hidden>
      <div className="pl-inner absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center">
          <div className="pl-tc tnum mb-7 font-mono text-[12px] tracking-[0.08em] text-cream/55">{tc(0)}</div>
          <div className="font-display text-[clamp(4rem,14vw,10rem)] font-bold leading-[0.9] tracking-[-0.045em]">
            <span className="pl-s inline-block text-saffron">{first[0]}</span>
            {first.slice(1).split("").map((c, i) => (
              <span key={i} className="mask"><span className="pl-l">{c}</span></span>
            ))}
          </div>
          <div className="pl-track relative mt-8 h-px w-[min(320px,72vw)] bg-cream/20">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="pl-key absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] block h-[10px] w-[10px] rotate-45 bg-cream" />
            ))}
          </div>
        </div>
      </div>
      {/* leading edge of the wipe */}
      <div className="absolute inset-x-0 bottom-0 h-[5px] bg-saffron" />
    </div>
  );
}
