"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";

/** Fades/slides direct children up with a stagger when they enter the viewport. */
export default function Reveal({ children, className = "", y = 40, stagger = 0.08, as: Tag = "div" }: { children: React.ReactNode; className?: string; y?: number; stagger?: number; as?: "div" | "ul" }) {
  const ref = useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.children, {
        y, opacity: 0, duration: 1.1, ease: "expo.out", stagger,
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
    }, ref);
    return () => ctx.revert();
  }, [y, stagger]);
  return <Tag ref={ref as never} className={className}>{children}</Tag>;
}
