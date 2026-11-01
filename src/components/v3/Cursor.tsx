"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, EASE, finePointer } from "@/lib/gsap";

type Mode = "default" | "link" | "play" | "drag";
const LOOK: Record<Mode, { size: number; bg: string; border: string; dot: number }> = {
  default: { size: 34, bg: "rgba(34,22,14,0)", border: "rgba(34,22,14,0.35)", dot: 1 },
  link: { size: 64, bg: "rgba(232,161,58,0.18)", border: "rgba(232,161,58,1)", dot: 1 },
  play: { size: 96, bg: "rgba(232,161,58,1)", border: "rgba(232,161,58,1)", dot: 0 },
  drag: { size: 84, bg: "rgba(34,22,14,1)", border: "rgba(34,22,14,1)", dot: 0 },
};

/** SC21: dot + trailing ring. Grows with a label over videos and the grade slider, swells over buttons. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!finePointer()) return;
    setOn(true);
    document.body.classList.add("has-cursor");
    const xd = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const yd = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const xr = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const yr = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) { shown = true; gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY }); gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.2 }); }
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY);
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button") as HTMLElement | null;
      const m = ((t?.dataset.cursor as Mode) || (t ? "link" : "default")) as Mode;
      setMode((p) => (p === m ? p : m));
    };
    const leave = () => { shown = false; gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.2 }); };
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  useEffect(() => {
    if (!on) return;
    const l = LOOK[mode];
    gsap.to(disc.current, { width: l.size, height: l.size, backgroundColor: l.bg, borderColor: l.border, duration: 0.35, ease: EASE.pop, overwrite: true });
    gsap.to(dot.current!.firstElementChild, { scale: l.dot, duration: 0.25, ease: EASE.pop, overwrite: true });
  }, [mode, on]);

  return (
    <div className={on ? "" : "hidden"} aria-hidden>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[400] opacity-0">
        <div ref={disc} className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border" style={{ width: 34, height: 34, borderColor: LOOK.default.border }}>
          {mode === "play" && (
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-espresso">
              <svg width="9" height="10" viewBox="0 0 9 10"><path d="M0 0l9 5-9 5z" fill="currentColor" /></svg>Play
            </span>
          )}
          {mode === "drag" && <span className="text-[13px] font-semibold text-cream">Drag</span>}
        </div>
      </div>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[401] opacity-0">
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-espresso" />
      </div>
    </div>
  );
}
