"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Magnetic from "../motion/Magnetic";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import { useVideoModal } from "../VideoModal";
import VideoThumb from "../VideoThumb";
import type { Project, Settings } from "@/content/site";

const PandaScene = dynamic(() => import("../three/PandaScene"), { ssr: false });

export default function Hero({ settings, projects }: { settings: Settings; projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState<boolean | null>(null);
  const open = useVideoModal();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

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

  return (
    <section ref={root} id="top" className="relative overflow-hidden">
      <div className="relative min-h-[92svh]">
        <div className="hero-canvas absolute inset-0">
          {mobile !== null && <PandaScene mobile={mobile} eventSource={root} />}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-bg via-bg/60 to-transparent md:h-48 md:via-transparent" />

        <div className="wrap pointer-events-none relative z-10 flex min-h-[92svh] flex-col justify-end pb-8 pt-28 md:pb-10">
          <div className="hero-fade label mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted">
            <span className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-fg">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              {settings.name}
            </span>
            <span>{settings.role}</span>
            <span className="hidden sm:inline">/ Now at {settings.currentCompany}</span>
            <span className="hidden md:inline">/ {settings.location}</span>
          </div>

          <h1 className="h-display text-[clamp(3.6rem,12vw,12.5rem)]" aria-label="I edit stories that stick.">
            <span className="split-line" aria-hidden><span className="hero-word inline-block">I&nbsp;edit</span></span>
            <span className="split-line" aria-hidden><span className="hero-word inline-block">stories</span></span>
            <span className="split-line" aria-hidden>
              <span className="hero-word inline-block text-stroke">that&nbsp;</span>
              <span className="hero-word inline-block text-lime">stick.</span>
            </span>
          </h1>

          <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
            <p className="hero-fade max-w-md text-[17px] leading-relaxed text-fg/70 md:text-lg">
              Self-taught motion designer and video editor, currently at {settings.currentCompany}. {settings.yearsExperience} years of SaaS explainers, product launches, podcasts and short-form content — built around a clear story and purposeful motion.
            </p>
            <div className="hero-fade pointer-events-auto flex flex-wrap gap-3">
              <Magnetic>
                <a href="#showreel" className="group inline-flex items-center gap-3 rounded-full bg-lime py-2 pl-2 pr-6 font-semibold text-bg shadow-[0_18px_40px_-18px_rgba(91,102,48,0.6)]">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-bg text-lime transition-transform duration-500 group-hover:rotate-[360deg]">
                    <svg width="12" height="12" viewBox="0 0 10 10"><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
                  </span>
                  Watch Showreel
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#contact" className="inline-flex h-14 items-center gap-2 rounded-full border border-line bg-card px-6 font-semibold hover:border-fg/40">
                  Work With Me <span aria-hidden>↗</span>
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
