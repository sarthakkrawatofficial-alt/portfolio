"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, EASE, reducedMotion } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";
import { asset } from "@/lib/asset";
import Btn from "./Btn";

const LINKS = [
  ["Work", "#work"],
  ["Case studies", "/case-studies/"],
  ["Services", "#services"],
  ["About", "#about"],
] as const;
const href = (h: string) => (h.startsWith("/") ? asset(h) : h);

function useNoidaTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const up = () => setT(f.format(new Date()).toUpperCase());
    up();
    const id = setInterval(up, 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Nav({ email, available }: { email: string; available: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const time = useNoidaTime();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { if (open) scrollState.lenis?.stop(); else scrollState.lenis?.start(); }, [open]);

  // SC06: nav items drop in one after another once the intro hands over
  useEffect(() => {
    const items = root.current!.querySelectorAll(".nav-item");
    const play = () => {
      if (reducedMotion()) { gsap.fromTo(items, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }); return; }
      gsap.fromTo(items, { y: -18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: EASE.settle, stagger: 0.06 });
    };
    window.addEventListener("intro:done", play, { once: true });
    return () => window.removeEventListener("intro:done", play);
  }, []);

  return (
    <>
      <header
        ref={root}
        className={`fixed inset-x-0 top-0 z-[120] transition-[background-color,box-shadow] duration-500 ${
          scrolled || open ? "bg-cream shadow-[0_1px_0_rgba(34,22,14,0.1)]" : "bg-transparent"
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between md:h-[76px]">
          <a href="#top" className="nav-item intro-hide flex items-center gap-2.5" aria-label="Sarthak Rawat, home">
            <span className="block h-2.5 w-2.5 rotate-45 bg-saffron" />
            <span className="font-display text-[21px] font-bold tracking-[-0.03em]">Sarthak</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map(([l, h]) => (
              <a key={h} href={href(h)} data-transition={h.startsWith("/") ? "" : undefined} className="nav-item intro-hide group relative py-1 text-[15px] text-espresso/80 hover:text-espresso">
                {l}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-espresso transition-transform duration-500 ease-[var(--ease-wipe)] group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <span className="nav-item intro-hide tnum hidden items-center gap-2 text-[14px] text-cocoa sm:flex">
              {available && (
                <span className="relative grid h-2 w-2 place-items-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-saffron/60" />
                  <span className="h-2 w-2 rounded-full bg-saffron" />
                </span>
              )}
              Noida {time}
            </span>
            <span className="nav-item intro-hide hidden md:inline-block">
              <Btn href={`mailto:${email}?subject=${encodeURIComponent("New project")}`} className="!h-11 !px-5 !text-[14px]">Start a project</Btn>
            </span>
            <button
              className="nav-item intro-hide grid h-11 w-11 place-items-center rounded-full border border-espresso/20 md:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[2px] w-5 bg-espresso transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[2px] w-5 bg-espresso transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      <div
        className={`fixed inset-0 z-[110] flex flex-col justify-end bg-cream px-4 pb-10 transition-[clip-path] duration-700 ease-[var(--ease-wipe)] md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        {[...LINKS, ["Contact", `mailto:${email}`] as const].map(([l, h]) => (
          <a key={h} href={href(h)} onClick={() => setOpen(false)} className="border-b border-espresso/10 py-3 font-display text-5xl font-bold tracking-[-0.04em]">
            {l}
          </a>
        ))}
      </div>
    </>
  );
}
