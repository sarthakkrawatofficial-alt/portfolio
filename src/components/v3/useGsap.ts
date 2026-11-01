"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type Q = (selector: string) => HTMLElement[];

/** Runs GSAP setup inside a context scoped to the returned ref; everything is reverted on unmount or re-run. */
export function useGsap<T extends HTMLElement = HTMLElement>(setup: (el: T, q: Q) => void | (() => void), deps: unknown[] = []) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = setup(el, gsap.utils.selector(el) as Q);
    }, el);
    return () => {
      if (typeof cleanup === "function") cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
