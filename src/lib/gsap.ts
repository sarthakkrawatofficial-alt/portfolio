"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

// The four easing tokens. Nothing else is used for motion on the site.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("settle", "M0,0 C0.16,1 0.3,1 1,1");
  CustomEase.create("wipe", "M0,0 C0.76,0 0.24,1 1,1");
  // small pull-back (-6%), overshoot (+4%), settle
  CustomEase.create("snap", "M0,0 C0.08,0 0.12,-0.06 0.18,-0.06 0.3,-0.06 0.42,1.04 0.62,1.04 0.78,1.04 0.85,1 1,1");
  // ?slowmo plays every animation at quarter speed, for reviewing timing
  if (/[?&]slowmo\b/.test(window.location.search)) gsap.globalTimeline.timeScale(0.25);
  if (process.env.NODE_ENV !== "production") (window as unknown as { gsap: typeof gsap }).gsap = gsap;
}

export const EASE = { settle: "settle", wipe: "wipe", snap: "snap", pop: "back.out(1.8)" } as const;

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export { gsap, ScrollTrigger };
