"use client";
import type Lenis from "lenis";

// Shared scroll state so non-DOM consumers (the 3D scene) can read progress cheaply.
export const scrollState = { y: 0, progress: 0, velocity: 0, lenis: null as Lenis | null };

export function scrollToTarget(target: string | number) {
  if (scrollState.lenis) scrollState.lenis.scrollTo(target as never, { offset: 0, duration: 1.4 });
  else if (typeof target === "string") document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: target, behavior: "smooth" });
}
