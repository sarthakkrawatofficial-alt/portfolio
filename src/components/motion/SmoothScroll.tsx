"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";

export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.1, wheelMultiplier: 1, touchMultiplier: 1.2 });
    scrollState.lenis = lenis;
    lenis.on("scroll", (l: Lenis) => {
      scrollState.y = l.scroll;
      scrollState.progress = l.limit ? l.scroll / l.limit : 0;
      scrollState.velocity = l.velocity;
      ScrollTrigger.update();
    });
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // anchor links → Lenis
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { duration: 1.6 });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, []);
  return null;
}
