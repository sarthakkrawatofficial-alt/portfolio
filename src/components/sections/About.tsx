"use client";
import { useRef } from "react";
import { asset } from "@/lib/asset";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import type { Job, Settings } from "@/content/site";
import SplitReveal from "../motion/SplitReveal";
import Reveal from "../motion/Reveal";

export default function About({ settings, journey }: { settings: Settings; journey: Job[] }) {
  const root = useRef<HTMLElement>(null);
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-img", { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.05, ease: "none", scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(".about-photo", { clipPath: "inset(18% 12% 18% 12% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "expo.out", duration: 1.6, scrollTrigger: { trigger: ".about-photo", start: "top 80%" } });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} id="about" className="relative py-24 md:py-36">
      <div className="wrap grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="about-photo relative aspect-[4/5] overflow-hidden rounded-[28px] border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/img/photo.webp")} alt={settings.name} className="about-img absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold tracking-tight text-white">{settings.name}</div>
                <div className="label mt-1 text-accentsoft">{settings.location}</div>
              </div>
              <span className="label rounded-full bg-lime px-3 py-1.5 text-[10px] font-bold text-bg">Self-taught</span>
            </div>
          </div>
        </div>
        <div className="md:col-span-7 md:pl-6">
          <div className="label mb-5 flex items-center gap-3 text-muted"><span className="text-lime">06</span><span className="h-px w-8 bg-line" />About</div>
          <SplitReveal lines={["I think in stories,", { text: "not effects.", className: "text-lime" }]} className="h-section" />
          <Reveal className="mt-8 grid gap-5 text-[17px] leading-relaxed text-fg/65 md:grid-cols-2">
            <p>It started with typography, layouts and thumbnails. Somewhere along the way the frames started moving — and I never looked back. {settings.yearsExperience} years in, I'm at {settings.currentCompany}, working across motion graphics, product storytelling, documentaries and talking-head content.</p>
            <p>Good visuals grab attention; good storytelling keeps it. Every project starts with the audience, the message and the purpose. The tools keep changing — the need for a well-told story doesn&apos;t.</p>
          </Reveal>
          <Reveal as="ul" className="mt-12 border-t border-line" y={24}>
            {journey.map((j, i) => (
              <li key={i} className="group grid grid-cols-12 items-baseline gap-3 border-b border-line py-5 transition-colors hover:bg-fg/[0.02]">
                <span className="label col-span-12 text-muted md:col-span-3">{j.period}</span>
                <div className="col-span-12 md:col-span-6">
                  <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                    {j.role}
                    {j.current && <span className="label rounded-full bg-lime px-2 py-0.5 text-[9px] text-bg">Now</span>}
                  </div>
                  <p className="mt-1 text-sm text-fg/55">{j.note}</p>
                </div>
                <span className="col-span-12 text-left text-sm font-medium text-fg/80 md:col-span-3 md:text-right">
                  {j.company}
                  {j.place && <span className="label block text-[10px] text-muted">{j.place}</span>}
                </span>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
