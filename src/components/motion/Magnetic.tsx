"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export default function Magnetic({ children, strength = 0.35, className = "" }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const inner = el.firstElementChild as HTMLElement;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const xi = gsap.quickTo(inner, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yi = gsap.quickTo(inner, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength); yTo(dy * strength); xi(dx * strength * 0.4); yi(dy * strength * 0.4);
    };
    const leave = () => { xTo(0); yTo(0); xi(0); yi(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [strength]);
  return <div ref={ref} className={`inline-block ${className}`}>{children}</div>;
}
