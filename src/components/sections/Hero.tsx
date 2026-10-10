"use client";
import { useRef } from "react";
import Magnetic from "../motion/Magnetic";
import PandaSprite from "../PandaSprite";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import { useVideoModal } from "../VideoModal";
import VideoThumb from "../VideoThumb";
import type { Project, Settings } from "@/content/site";
import { asset } from "@/lib/asset";

export default function Hero({ settings, projects }: { settings: Settings; projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const open = useVideoModal();

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".hero-word");
      gsap.set(words, { yPercent: 110 });
      gsap.set(".hero-fade", { opacity: 0, y: 24 });
      gsap.set(".hero-canvas", { opacity: 0, scale: 1.08 });
      const play = () => {
        const tl = gsap.timeline();
        tl.to(".hero-canvas", { opacity: 1, scale: 1, duration: 1.8, ease: "expo.out" })
          .to(words, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.07 }, 0.1)
          .to(".hero-fade", { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.5);
      };
      window.addEventListener("intro:done", play, { once: true });
      // safety: if the intro event was missed
      const t = setTimeout(play, 2600);
      return () => { clearTimeout(t); window.removeEventListener("intro:done", play); };
    }, root);
    return () => ctx.revert();
  }, []);

  const reel = [...projects, ...projects];
  const playReel = () => open({ id: settings.showreelId, title: "Showreel 2026" });

  return (
    <section ref={root} id="top" className="relative overflow-hidden">
      <div className="relative min-h-[92svh]">
        <div className="hero-canvas absolute inset-x-4 top-[88px] md:inset-x-auto md:right-10 md:top-[17svh] md:w-[47vw] md:max-w-[840px]">
          <div aria-hidden className="pointer-events-none absolute -inset-[12%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-lime)_16%,transparent),transparent)]" />
          {/* the showreel, playing silently; click for the full cut with sound */}
          <button
            type="button"
            id="showreel"
            data-cursor="play"
            onClick={playReel}
            aria-label="Play Showreel 2026 with sound"
            className="group pointer-events-auto relative block aspect-video w-full overflow-hidden rounded-[22px] border border-line bg-black shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] md:rounded-[28px]"
          >
            <video className="absolute inset-0 h-full w-full object-cover" src={asset("/video/reel-loop.mp4")} poster={asset("/video/reel-loop.jpg")} autoPlay muted loop playsInline preload="metadata" />
            <span className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-full bg-bg/85 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-fg backdrop-blur transition-colors duration-300 group-hover:bg-lime group-hover:text-bg md:bottom-4 md:left-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-bg transition-colors duration-300 group-hover:bg-bg group-hover:text-lime">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
              </span>
              Showreel 2026 · 0:48
            </span>
          </button>
        </div>

        <div className="wrap pointer-events-none relative z-10 flex min-h-[92svh] flex-col justify-end pb-8 pt-[calc(88px+56.25vw+28px)] md:pb-10 md:pt-28">
          <div className="hero-fade label mb-5 text-muted">
            {settings.name} · {settings.role} · {settings.location}
          </div>

          <h1 className="h-display relative text-[clamp(3.4rem,10.4vw,10.5rem)]" aria-label="I edit stories that stick.">
            {/* the panda stands in the gap after "I edit" */}
            <span aria-hidden className="hero-fade absolute left-[2.72em] top-[-0.1em] block h-[1.02em]">
              <PandaSprite className="pointer-events-auto relative h-full cursor-pointer" />
            </span>
            <span className="split-line" aria-hidden><span className="hero-word inline-block">I&nbsp;edit</span></span>
            <span className="split-line" aria-hidden><span className="hero-word inline-block">stories</span></span>
            <span className="split-line" aria-hidden>
              <span className="hero-word inline-block text-stroke">that&nbsp;</span>
              <span className="hero-word inline-block text-lime">stick.</span>
            </span>
          </h1>

          <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
            <p className="hero-fade max-w-md text-[17px] leading-relaxed text-fg/70 md:text-lg">
              Motion designer and video editor at {settings.currentCompany}. I started in 2023 at a media house in Prayagraj, shooting and cutting on deadline. Now I make software easy to understand in under a minute.
            </p>
            <div className="hero-fade pointer-events-auto flex flex-wrap gap-3">
              <Magnetic>
                <button type="button" onClick={playReel} className="group inline-flex items-center gap-3 rounded-full bg-lime py-2 pl-2 pr-6 font-semibold text-bg">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-bg text-lime">
                    <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
                  </span>
                  Watch the reel
                </button>
              </Magnetic>
              <Magnetic>
                <a href="#contact" className="inline-flex h-14 items-center gap-2 rounded-full border border-line bg-card px-6 font-semibold hover:border-fg/40">
                  Hire me <span aria-hidden>↗</span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      {/* thumbnail marquee */}
      <div className="hero-fade marquee-host fade-x relative z-10 overflow-hidden pb-6 pt-4">
        <div className="marquee pausable" style={{ ["--dur" as string]: "70s" }}>
          {reel.map((p, i) => (
            <button
              key={i}
              type="button"
              data-cursor="play"
              onClick={() => open({ id: p.youtubeId, title: p.title, orientation: p.orientation })}
              className={`group relative mr-4 h-[210px] shrink-0 overflow-hidden rounded-2xl border border-line md:h-[300px] ${p.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video"}`}
              aria-label={`Play ${p.title} — ${p.client}`}
              tabIndex={i >= projects.length ? -1 : 0}
            >
              <VideoThumb id={p.youtubeId} title={p.title} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute left-3 top-3 label rounded-full bg-black/70 px-2.5 py-1 text-[10px] text-white/85">
                {p.orientation === "portrait" ? "9:16" : "16:9"}
              </div>
              <div className="pointer-events-none absolute inset-x-3 bottom-3 text-left">
                <div className="label text-[10px] text-accentsoft">{p.client}</div>
                <div className="mt-1 text-[15px] font-bold leading-tight tracking-tight text-white">{p.title}</div>
              </div>
              <div className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 scale-50 place-items-center rounded-full bg-lime text-bg opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
