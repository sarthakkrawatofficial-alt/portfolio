"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";

export default function Counter({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useIsoLayoutEffect(() => {
    const o = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(o, {
        v: value,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 92%" },
        onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(o.v) + suffix; },
      });
    });
    return () => ctx.revert();
  }, [value, suffix]);
  return <span ref={ref} className={className}>{value}{suffix}</span>;
}
