"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";

type Line = string | { text: string; className?: string };

/** Headline that reveals word by word (masked per line) when it scrolls into view. */
export default function SplitReveal({
  lines,
  as: Tag = "h2",
  className = "",
  delay = 0,
  immediate = false,
}: {
  lines: Line[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words = ref.current!.querySelectorAll(".split-word");
      gsap.set(words, { yPercent: 115, rotate: 4 });
      gsap.to(words, {
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.05,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 88%" },
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, immediate]);

  return (
    <Tag ref={ref} className={className} aria-label={lines.map((l) => (typeof l === "string" ? l : l.text)).join(" ")}>
      {lines.map((l, i) => {
        const text = typeof l === "string" ? l : l.text;
        const cls = typeof l === "string" ? "" : l.className ?? "";
        return (
          <span key={i} className={`split-line ${cls}`} aria-hidden>
            {text.split(" ").map((w, j, arr) => (
              <span key={j} className="split-word">
                {w}
                {j < arr.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}
