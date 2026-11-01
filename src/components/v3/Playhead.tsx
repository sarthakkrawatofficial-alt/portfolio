"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";

const RUNTIME = 48; // the page plays like a 48 s timeline, the showreel's length
const FPS = 25;
const p2 = (n: number) => String(n).padStart(2, "0");

/** SC07: scroll progress as a playhead bar with a keyframe diamond, plus a running timecode. */
export default function Playhead() {
  const fill = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let last = -1;
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollState.lenis ? scrollState.progress : max > 0 ? window.scrollY / max : 0;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      fill.current!.style.transform = `scaleX(${p})`;
      head.current!.style.transform = `translateX(${p * window.innerWidth}px)`;
      const f = Math.round(p * RUNTIME * FPS);
      tc.current!.textContent = `00:00:${p2(Math.floor(f / FPS))}:${p2(f % FPS)}`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div aria-hidden>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-[2px] bg-espresso/10">
        <div ref={fill} className="h-full origin-left bg-espresso" style={{ transform: "scaleX(0)" }} />
        <div ref={head} className="absolute left-0 top-1/2">
          <span className="absolute -left-[5px] -top-[5px] block h-[10px] w-[10px] rotate-45 bg-saffron" />
        </div>
      </div>
      <span ref={tc} className="tnum pointer-events-none fixed bottom-4 right-5 z-[130] hidden font-mono text-[11px] tracking-[0.06em] text-cocoa md:block">
        00:00:00:00
      </span>
    </div>
  );
}
