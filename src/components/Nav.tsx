"use client";
import { useEffect, useState } from "react";
import Magnetic from "./motion/Magnetic";
import { scrollState } from "@/lib/scroll";

const LINKS = [
  ["Work", "#work"],
  ["Services", "#services"],
  ["Process", "#process"],
  ["About", "#about"],
  ["FAQ", "#faq"],
] as const;

export default function Nav({ available }: { available: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { if (open) scrollState.lenis?.stop(); else scrollState.lenis?.start(); }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[120] border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || open ? "border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150" : "border-transparent bg-transparent"
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between md:h-[72px]">
          <a href="#top" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight" aria-label="Sarthak Rawat — home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-bg">
              <svg width="12" height="12" viewBox="0 0 10 10"><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
            </span>
            <span>Sarthak<span className="text-lime">.</span></span>
          </a>
          <nav className={`hidden items-center gap-1 rounded-full border border-line p-1.5 transition-colors md:flex ${scrolled ? "bg-fg/[0.04]" : "bg-card/70"}`}>
            {LINKS.map(([l, h]) => (
              <a key={h} href={h} className="rounded-full px-4 py-2 text-sm text-fg/75 transition-colors hover:bg-fg/[0.06] hover:text-fg">
                {l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {available && (
              <span className="label hidden items-center gap-2 text-muted lg:flex">
                <span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-lime" style={{ animation: "pulse-ring 1.6s ease-out infinite" }} /><span className="relative h-2 w-2 rounded-full bg-lime" /></span>
                Booking now
              </span>
            )}
            <Magnetic className="hidden md:inline-block">
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-bg">
                Work With Me <span aria-hidden>↗</span>
              </a>
            </Magnetic>
            <button className="grid h-11 w-11 place-items-center rounded-full border border-line bg-card/80 md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[2px] w-5 bg-fg transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[2px] w-5 bg-fg transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className={`fixed inset-0 z-[110] flex flex-col justify-end bg-bg px-4 pb-10 transition-[clip-path] duration-700 ease-[cubic-bezier(.16,1,.3,1)] md:hidden ${open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"}`}>
        <div className="flex flex-col gap-1">
          {[...LINKS, ["Contact", "#contact"] as const].map(([l, h], i) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="flex items-baseline justify-between border-b border-line py-3 text-5xl font-extrabold tracking-tight">
              {l}<span className="label text-lime">0{i + 1}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
