"use client";
import { useEffect, useRef } from "react";
import { gsap, EASE, reducedMotion, isMobile } from "@/lib/gsap";
import type { Settings } from "@/content/site";
import { usePlayer } from "./Player";
import Split from "./Split";
import WordSwap from "./WordSwap";
import SectionLabel from "./SectionLabel";
import Character from "./Character";
import Btn from "./Btn";

const WORDS = ["edit.", "animate.", "design.", "grade."];

export default function Hero({ settings }: { settings: Settings }) {
  const root = useRef<HTMLElement>(null);
  const open = usePlayer();

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const reduce = reducedMotion();
    const mobile = isMobile();
    // SC02: letters (words on mobile) rise out of their masks, line 2 starts 0.12 s after line 1
    const l1 = mobile ? q(".hl-1 .w-in") : q(".hl-1 .ch");
    const l2 = mobile ? [...q(".hl-2 .w-in"), ...q(".hl-2 .reveal")] : [...q(".hl-2 .mask .ch"), ...q(".hl-2 .reveal")];
    const fades = q(".hero-fade");
    if (!reduce) {
      gsap.set([...l1, ...l2], { yPercent: 110 });
      gsap.set(fades, { y: 24, autoAlpha: 0 });
    }
    gsap.set(q("h1"), { autoAlpha: 1 });

    const play = () => {
      if (reduce) {
        gsap.fromTo(fades, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
        window.dispatchEvent(new Event("hero:in"));
        return;
      }
      const st = mobile ? 0.05 : 0.025;
      const tl = gsap.timeline({ onComplete: () => window.dispatchEvent(new Event("hero:in")) });
      tl.to(l1, { yPercent: 0, duration: 1.1, ease: EASE.settle, stagger: st }, 0)
        .to(l2, { yPercent: 0, duration: 1.1, ease: EASE.settle, stagger: st }, 0.12)
        // SC06: copy, then buttons, then the bottom strip, overlapping
        .to(fades, { y: 0, autoAlpha: 1, duration: 0.8, ease: EASE.settle, stagger: mobile ? 0.03 : 0.06 }, 0.35);
    };
    window.addEventListener("intro:done", play, { once: true });
    return () => window.removeEventListener("intro:done", play);
  }, []);

  const playReel = () => open({ id: settings.showreelId, title: "Showreel 2026" });

  return (
    <section ref={root} id="top" className="relative overflow-hidden">
      <div className="wrap grid min-h-[100svh] grid-cols-1 content-center gap-y-6 pb-20 pt-20 md:grid-cols-12 md:grid-rows-[auto_auto] md:gap-x-6 md:gap-y-0 md:pb-28 md:pt-28">
        <div className="relative z-10 md:col-span-7 md:row-start-1 md:self-end">
          <SectionLabel sc="01" time="00:00" on="intro" className="mb-6 md:mb-8" />
          <h1
            className="intro-hide font-display text-[clamp(3.1rem,7.4vw,7.75rem)] font-bold leading-[0.98] tracking-[-0.045em] text-espresso"
            aria-label={`Hi, I'm ${settings.name.split(" ")[0]}. I edit, animate, design and grade.`}
          >
            <span className="hl-1 block" aria-hidden>
              <Split text={`Hi, I'm ${settings.name.split(" ")[0]}.`} />
            </span>
            <span className="hl-2 block whitespace-nowrap" aria-hidden>
              <Split text="I" /> <WordSwap words={WORDS} />
            </span>
          </h1>
        </div>
        {/* phones: character sits between the headline and the copy so it's above the fold */}
        <div className="relative mb-8 md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:mb-12 md:self-end">
          <Character zoneRoot={root} />
        </div>
        <div className="relative z-10 md:col-span-7 md:row-start-2 md:self-start">
          <p className="hero-fade intro-hide max-w-[30rem] text-[17px] leading-relaxed text-espresso/75 md:mt-9 md:text-[19px]">
            Video editor and motion designer at {settings.currentCompany}. I make software easy to understand in under a minute.
          </p>
          <div className="hero-fade intro-hide mt-7 flex flex-wrap gap-3 md:mt-10">
            <Btn onClick={playReel} icon={<svg width="10" height="11" viewBox="0 0 9 10" aria-hidden><path d="M0 0l9 5-9 5z" fill="currentColor" /></svg>}>
              Watch the reel
            </Btn>
            <Btn variant="ghost" href={`mailto:${settings.email}?subject=${encodeURIComponent("New project")}`}>Start a project</Btn>
          </div>
        </div>
      </div>
      <div className="hero-fade intro-hide wrap absolute inset-x-0 bottom-0 flex items-center justify-between pb-6 text-[14px] text-cocoa">
        <span>Available for freelance, worldwide</span>
        <span className="flex items-center gap-3 md:hidden">
          Scroll
          <span className="relative block h-px w-10 overflow-hidden bg-espresso/15">
            <span className="absolute inset-y-0 left-0 w-1/2 animate-[scrollcue_1.8s_var(--ease-wipe)_infinite] bg-espresso" />
          </span>
        </span>
      </div>
    </section>
  );
}
