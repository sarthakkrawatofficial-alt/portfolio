"use client";
import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import { ytEmbed, ytThumb } from "@/content/site";
import SectionHead from "./SectionHead";

export default function Showreel({ id }: { id: string }) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(frame.current, { scale: 0.86, borderRadius: 48 }, {
        scale: 1, borderRadius: 28, ease: "none",
        scrollTrigger: { trigger: frame.current, start: "top bottom", end: "center center", scrub: true },
      });
      gsap.fromTo(".reel-img", { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to(".reel-ring", { rotate: 360, duration: 14, ease: "none", repeat: -1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="showreel" className="relative py-24 md:py-36">
      <div className="wrap">
        <SectionHead
          index="01"
          label="Showreel 2025"
          lines={["Two minutes.", { text: "No explanations.", className: "text-fg/35" }]}
          aside={<p>A fast cut through SaaS launches, podcasts, tours and short-form — the clearest way to see how I pace a story.</p>}
        />
      </div>
      <div className="mx-auto mt-12 w-full max-w-[1600px] px-3 md:mt-16 md:px-6">
        <div ref={frame} className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-black sm:aspect-video" style={{ borderRadius: 28 }}>
          {playing ? (
            <iframe className="absolute inset-0 h-full w-full" src={ytEmbed(id)} title="Sarthak Rawat — Showreel" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          ) : (
            <button type="button" data-cursor="play" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label="Play showreel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ytThumb(id, "maxres")} onError={(e) => ((e.currentTarget as HTMLImageElement).src = ytThumb(id))} alt="" className="reel-img absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-700 group-hover:opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(7,7,7,0.85)_100%)]" />
              {/* letterbox + HUD */}
              <div className="absolute inset-x-0 top-0 h-[9%] bg-black/90" />
              <div className="absolute inset-x-0 bottom-0 h-[9%] bg-black/90" />
              <div className="label absolute left-4 top-[calc(9%+14px)] flex items-center gap-2 text-white/85 md:left-8">
                <span className="h-2 w-2 rounded-full bg-lime" style={{ animation: "blink 1.2s steps(2) infinite" }} /> REC · 4K · 23.976
              </div>
              <div className="label absolute right-4 top-[calc(9%+14px)] hidden text-white/65 sm:block md:right-8">SR_REEL_2025_FINAL_v7.mov</div>
              <div className="label absolute bottom-[calc(9%+14px)] left-4 text-white/65 md:left-8">00:00:00:00</div>
              <div className="label absolute bottom-[calc(9%+14px)] right-4 text-white/65 md:right-8">≈ 02:00</div>
              {/* corner brackets */}
              {[
                "left-4 top-[16%] border-l border-t md:left-8",
                "right-4 top-[16%] border-r border-t md:right-8",
                "left-4 bottom-[16%] border-l border-b md:left-8",
                "right-4 bottom-[16%] border-r border-b md:right-8",
              ].map((c) => (
                <span key={c} className={`absolute h-6 w-6 border-white/60 md:h-10 md:w-10 ${c}`} />
              ))}
              {/* play button */}
              <span className="absolute left-1/2 top-1/2 grid h-36 w-36 -translate-x-1/2 -translate-y-1/2 place-items-center md:h-48 md:w-48">
                <svg className="reel-ring absolute inset-0 h-full w-full" viewBox="0 0 200 200" aria-hidden>
                  <defs><path id="circ" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" /></defs>
                  <text fill="#F2F2F2" fontSize="13" fontFamily="var(--font-mono)">
                    <textPath href="#circ" textLength="512" lengthAdjust="spacing">PLAY SHOWREEL · 2025 · PLAY SHOWREEL · 2025 · </textPath>
                  </text>
                </svg>
                <span className="grid h-20 w-20 place-items-center rounded-full bg-lime text-bg shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 md:h-24 md:w-24">
                  <svg width="22" height="22" viewBox="0 0 10 10" className="translate-x-0.5"><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
