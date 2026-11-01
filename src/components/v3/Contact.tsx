"use client";
import { useState } from "react";
import { gsap, EASE, reducedMotion, isMobile } from "@/lib/gsap";
import type { Settings } from "@/content/site";
import { asset } from "@/lib/asset";
import { useGsap } from "./useGsap";
import Panel from "./Panel";
import SectionLabel from "./SectionLabel";
import Btn from "./Btn";

const LINES = ["Got a story", "worth telling?"];

/** SC20: the headline's letters fly in from scattered positions and lock into place as you scroll. */
export default function Contact({ settings }: { settings: Settings }) {
  const [copied, setCopied] = useState(false);

  const ref = useGsap<HTMLDivElement>((el, q) => {
    if (reducedMotion()) return;
    const m = isMobile();
    const spread = m ? 0.5 : 1;
    gsap.fromTo(
      q(".ct-ch"),
      { x: () => gsap.utils.random(-260, 260) * spread, y: () => gsap.utils.random(-160, 200) * spread, rotate: () => gsap.utils.random(-50, 50), opacity: 0 },
      { x: 0, y: 0, rotate: 0, opacity: 1, ease: EASE.snap, stagger: { each: 0.02, from: "random" }, scrollTrigger: { trigger: el, start: "top 85%", end: "top 25%", scrub: 0.6 } },
    );
  });

  const copy = async () => {
    try { await navigator.clipboard.writeText(settings.email); } catch { window.location.href = `mailto:${settings.email}`; return; }
    setCopied(true);
    gsap.fromTo(".ct-copied", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: EASE.pop });
    setTimeout(() => setCopied(false), 1800);
  };

  const year = new Date().getFullYear();
  return (
    <Panel id="contact" className="bg-espresso text-cream">
      <div ref={ref} className="wrap relative pb-10 pt-24 md:pt-36">
        <SectionLabel sc="19" time="00:46" className="mb-8 [&_*]:!text-cream/60" />
        <h2 className="font-display text-[clamp(3.2rem,11vw,11rem)] font-bold leading-[0.98] tracking-[-0.05em]" aria-label={LINES.join(" ")}>
          {LINES.map((l, li) => (
            <span key={l} className={`block ${li ? "text-saffron" : ""}`} aria-hidden>
              {l.split("").map((c, i) => <span key={i} className="ct-ch inline-block whitespace-pre">{c}</span>)}
            </span>
          ))}
        </h2>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="max-w-md text-[17px] leading-relaxed text-cream/70">I take freelance projects alongside my job and I&apos;m open to full-time roles. Send the brief or the raw footage, and tell me where the video is going to be posted.</p>
            <button onClick={copy} data-cursor="link" className="group relative mt-8 block max-w-full break-words text-left font-display text-[clamp(1.05rem,4.6vw,3rem)] font-bold tracking-[-0.03em]">
              {settings.email}
              <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-right scale-x-0 bg-saffron transition-transform duration-500 ease-[var(--ease-wipe)] group-hover:origin-left group-hover:scale-x-100" />
              <span className="mt-2 block text-[14px] font-normal tracking-normal text-cream/55">{copied ? <span className="ct-copied inline-block text-saffron">Copied to clipboard</span> : "Click to copy"}</span>
            </button>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href={`mailto:${settings.email}?subject=${encodeURIComponent("New project")}`}>Start a project</Btn>
              <a href={settings.phoneHref} className="inline-flex h-14 items-center rounded-full border border-cream/25 px-6 text-[16px] hover:border-cream">{settings.phone}</a>
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center rounded-full border border-cream/25 px-6 text-[16px] hover:border-cream">Instagram</a>
            </div>
          </div>
        </div>

        <footer className="mt-24 border-t border-cream/15 pt-10 md:mt-32">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <a href="#top" className="font-display text-[22vw] font-bold leading-[0.8] tracking-[-0.06em] text-cream/10 md:text-[13vw]" aria-label="Back to top">
              Sarthak
            </a>
            <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-[15px] text-cream/70 md:mb-4">
              <a href="#work" className="hover:text-cream">Work</a>
              <a href={asset("/case-studies/")} data-transition className="hover:text-cream">Case studies</a>
              <a href="#about" className="hover:text-cream">About</a>
              <a href={asset("/resources.html")} data-transition className="hover:text-cream">Resources</a>
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-cream">Instagram</a>
              <a href="#top" className="hover:text-cream">Back to top</a>
            </nav>
          </div>
          <p className="mt-10 text-[14px] text-cream/45">© {year} {settings.name}, {settings.location}</p>
        </footer>
      </div>
    </Panel>
  );
}
