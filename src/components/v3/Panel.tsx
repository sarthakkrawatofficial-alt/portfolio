"use client";
import { gsap, EASE, reducedMotion, isMobile } from "@/lib/gsap";
import { useGsap } from "./useGsap";

/** SC09: a coloured section opens out of a rounded inset as it scrolls in (clip-path, scrubbed both ways). */
export default function Panel({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  const ref = useGsap<HTMLElement>((el) => {
    if (reducedMotion()) return;
    const m = isMobile();
    gsap.fromTo(
      el,
      { clipPath: m ? "inset(3% 2% 0% 2% round 24px)" : "inset(7% 4% 0% 4% round 48px)" },
      { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: EASE.settle, scrollTrigger: { trigger: el, start: "top bottom", end: m ? "top 55%" : "top 30%", scrub: 0.6 } },
    );
  });
  return (
    <section ref={ref} id={id} className={`relative overflow-x-clip ${className}`}>
      {children}
    </section>
  );
}
