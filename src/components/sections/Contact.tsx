"use client";
import { useRef } from "react";
import { asset } from "@/lib/asset";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import type { Settings } from "@/content/site";
import Magnetic from "../motion/Magnetic";
import SplitReveal from "../motion/SplitReveal";

export default function Contact({ settings }: { settings: Settings }) {
  const root = useRef<HTMLElement>(null);
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".cta-panel", { scale: 0.92, borderRadius: 64 }, { scale: 1, borderRadius: 36, ease: "none", scrollTrigger: { trigger: ".cta-panel", start: "top bottom", end: "top 30%", scrub: true } });
      gsap.to(".cta-spin", { rotate: 360, duration: 12, repeat: -1, ease: "none" });
    }, root);
    return () => ctx.revert();
  }, []);
  const year = new Date().getFullYear();
  return (
    <section ref={root} id="contact" className="relative pt-16 md:pt-24">
      <div className="px-3 md:px-6">
        <div className="cta-panel relative mx-auto max-w-[1600px] overflow-hidden border border-line bg-card px-5 pb-10 pt-20 md:px-14 md:pb-14 md:pt-32" style={{ borderRadius: 36 }}>
          <div aria-hidden className="pointer-events-none absolute inset-0 tex-grain" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-lime/10 blur-[140px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(31,28,24,1)_1px,transparent_1px),linear-gradient(90deg,rgba(31,28,24,1)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_70%_20%,#000,transparent_70%)]" />
          <div className="relative">
            <div className="label mb-6 flex items-center gap-3 text-muted"><span className="text-lime">09</span><span className="h-px w-8 bg-line" />Let&apos;s talk</div>
            <SplitReveal lines={["Got a story", { text: "worth telling?", className: "text-lime" }]} className="h-display text-[clamp(3.2rem,11vw,11rem)]" />
            <div className="mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="max-w-md text-lg text-fg/65">Open to freelance projects, collaborations and creative roles. Send the brief, the footage, or just the idea — if it&apos;s a good story, I&apos;m in.</p>
                <a href={`mailto:${settings.email}`} className="group mt-8 inline-flex max-w-full items-center gap-3 break-all text-[clamp(1.15rem,5vw,2.25rem)] font-bold tracking-tight md:break-normal">
                  <span className="bg-gradient-to-r from-lime to-lime bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">{settings.email}</span>
                  <span className="text-lime transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                </a>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a href={settings.phoneHref} className="rounded-full border border-line px-4 py-2.5 text-sm hover:border-lime hover:text-lime">{settings.phone}</a>
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-4 py-2.5 text-sm hover:border-lime hover:text-lime">Instagram {settings.instagramHandle}</a>
                </div>
              </div>
              <Magnetic strength={0.4} className="self-start md:self-auto">
                <a href={`mailto:${settings.email}?subject=${encodeURIComponent("New project — let's talk")}`} className="relative grid h-44 w-44 place-items-center rounded-full bg-lime text-bg shadow-[0_30px_60px_-24px_rgba(60,70,30,0.6)] md:h-56 md:w-56">
                  <svg className="cta-spin absolute inset-2" viewBox="0 0 200 200" aria-hidden>
                    <defs><path id="cta-c" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0" /></defs>
                    <text fill="var(--color-bg)" style={{ fill: "var(--color-bg)" }} fontSize="13" fontWeight="600" fontFamily="var(--font-mono)"><textPath href="#cta-c" textLength="524" lengthAdjust="spacing">START A PROJECT · WORK WITH ME · </textPath></text>
                  </svg>
                  <span className="text-4xl" aria-hidden>↗</span>
                  <span className="sr-only">Start a project</span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      <footer className="wrap pb-8 pt-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="h-display select-none text-[22vw] leading-[0.8] text-fg/[0.06] md:text-[14vw]">Sarthak<span className="text-lime/40">.</span></div>
          <nav className="label grid grid-cols-2 gap-x-10 gap-y-3 text-fg/60 md:mb-6">
            <a href="#work" className="hover:text-lime">Work</a>
            <a href="#services" className="hover:text-lime">Services</a>
            <a href="#process" className="hover:text-lime">Process</a>
            <a href={asset("/resources.html")} data-transition className="hover:text-lime">Resources</a>
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-lime">Instagram</a>
            <a href="#top" className="hover:text-lime">Back to top ↑</a>
          </nav>
        </div>
        <div className="label mt-8 flex flex-col justify-between gap-2 border-t border-line pt-6 text-[10px] text-muted md:flex-row">
          <span>© {year} {settings.name} — All rights reserved</span>
          <span>Edit · Motion · Story — {settings.location}</span>
        </div>
      </footer>
    </section>
  );
}
