"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

type Mode = "default" | "link" | "play" | "drag";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    if (!dot.current || !ring.current) return;
    document.body.classList.add("has-cursor");
    const xd = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const yd = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const xr = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const yr = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => {
      if (!shown) { shown = true; gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY }); enter(); }
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY);
      const t = (e.target as HTMLElement)?.closest?.("[data-cursor], a, button") as HTMLElement | null;
      const m = (t?.dataset.cursor as Mode) || (t ? "link" : "default");
      setMode((prev) => (prev === m ? prev : m));
    };
    let shown = false;
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 });
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 });
    
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  const size = mode === "play" ? 96 : mode === "link" ? 54 : mode === "drag" ? 80 : 34;
  return (
    <div className={enabled ? "" : "hidden"}>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[200] opacity-0" aria-hidden>
        <div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center transition-[width,height,background-color,border-color] duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
          style={{
            width: size,
            height: size,
            background: mode === "play" ? "var(--color-lime)" : mode === "drag" ? "rgba(31,28,24,0.55)" : mode === "link" ? "color-mix(in srgb, var(--color-lime) 10%, transparent)" : "transparent",
            border: `1px solid ${mode === "default" ? "color-mix(in srgb, var(--color-fg) 35%, transparent)" : "var(--color-lime)"}`,
            mixBlendMode: mode === "play" ? "normal" : "normal",
          }}
        >
          {mode === "play" && (
            <span className="label flex items-center gap-1.5 !text-[11px] font-bold text-bg">
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>PLAY
            </span>
          )}
          {mode === "drag" && <span className="label font-bold text-white">DRAG</span>}
        </div>
      </div>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[201] opacity-0" aria-hidden>
        <div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-lime transition-transform duration-200"
          style={{ width: 6, height: 6, transform: `translate(-50%,-50%) scale(${mode === "play" || mode === "drag" ? 0 : 1})` }}
        />
      </div>
    </div>
  );
}
