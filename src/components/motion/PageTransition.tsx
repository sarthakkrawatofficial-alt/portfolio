"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Curtain transition: plays an intro wipe on load, and covers the screen before
 * navigating away via links marked data-transition (e.g. /resources).
 */
export default function PageTransition({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panels = root.current!.querySelectorAll(".pt-panel");
    const label = root.current!.querySelector(".pt-label");
    const tl = gsap.timeline({ onComplete: () => { root.current!.style.pointerEvents = "none"; window.dispatchEvent(new Event("intro:done")); } });
    tl.fromTo(label, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "expo.out" })
      .to(label, { yPercent: -100, duration: 0.5, ease: "expo.in" }, "+=0.25")
      .to(panels, { yPercent: -100, duration: 0.9, ease: "expo.inOut", stagger: 0.06 }, "-=0.15");

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[data-transition]") as HTMLAnchorElement | null;
      if (!a || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      root.current!.style.pointerEvents = "auto";
      gsap.fromTo(panels, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "expo.inOut", stagger: 0.05, onComplete: () => { window.location.href = a.href; } });
    };
    // restore when coming back via bfcache
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) gsap.set(panels, { yPercent: -100 }); };
    document.addEventListener("click", onClick);
    window.addEventListener("pageshow", onShow);
    return () => { tl.kill(); document.removeEventListener("click", onClick); window.removeEventListener("pageshow", onShow); };
  }, []);
  return (
    <div ref={root} className="fixed inset-0 z-[300] flex" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`pt-panel h-full flex-1 ${i === 3 ? "bg-lime" : "bg-card2"}`} />
      ))}
      <div className="absolute inset-0 grid place-items-center overflow-hidden">
        <div className="overflow-hidden">
          <div className="pt-label h-display text-[12vw] md:text-[6vw] text-fg">
            {name.split(" ")[0]}<span className="text-lime">.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
