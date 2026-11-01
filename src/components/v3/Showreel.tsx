"use client";
import { useRef } from "react";
import { gsap, EASE, reducedMotion, isMobile } from "@/lib/gsap";
import { asset } from "@/lib/asset";
import { useGsap } from "./useGsap";
import { usePlayer } from "./Player";
import SectionLabel from "./SectionLabel";

const TITLE = "Showreel 2026";

/** SC10: pinned. The whole reel plays small (nothing cropped) and scales up to full screen as you scroll;
 *  then the safe-area guides draw in and the title assembles over it. */
export default function Showreel({ id }: { id: string }) {
  const open = usePlayer();
  const frame = useRef<HTMLButtonElement>(null);

  const ref = useGsap<HTMLElement>((el, q) => {
    const video = q("video")[0] as HTMLVideoElement;
    // load the loop only when it's close
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !video.src) { video.src = video.dataset.src!; video.play().catch(() => {}); }
    }, { rootMargin: "400px" });
    io.observe(el);
    if (reducedMotion()) return () => io.disconnect();

    const m = isMobile();
    gsap.set(q(".sr-ch"), { yPercent: 120, rotate: () => gsap.utils.random(-14, 14), opacity: 0 });
    gsap.set(q(".sr-guide"), { scale: 0, opacity: 0 });
    const s0 = m ? 0.84 : 0.52;
    gsap.set(q(".sr-shade"), { opacity: 0 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top top", end: m ? "+=90%" : "+=140%", pin: true, scrub: 0.6 },
    });
    tl.fromTo(q(".sr-frame"), { scale: s0, borderRadius: m ? 24 / s0 : 28 / s0 }, { scale: 1, borderRadius: 0, ease: EASE.settle, duration: 1 })
      .to(q(".sr-shade"), { opacity: 1, ease: "none", duration: 0.4 }, 0.35)
      .to(q(".sr-ch"), { yPercent: 0, rotate: 0, opacity: 1, ease: EASE.snap, duration: 0.5, stagger: 0.03 }, 0.35)
      .to(q(".sr-guide"), { scale: 1, opacity: 1, ease: EASE.pop, duration: 0.25, stagger: 0.04 }, 0.7)
      .to(q(".sr-hint"), { opacity: 1, y: 0, ease: EASE.settle, duration: 0.2 }, 0.85);
    return () => io.disconnect();
  });

  return (
    <section ref={ref} id="showreel" className="relative h-[100svh] overflow-hidden bg-cream">
      <div className="wrap absolute inset-x-0 top-0 z-10 pt-24 md:pt-28">
        <SectionLabel sc="10" time="00:19" />
      </div>
      <button
        ref={frame}
        type="button"
        data-cursor="play"
        onClick={() => open({ id, title: "Showreel 2026", from: frame.current })}
        aria-label="Play Showreel 2026 with sound"
        className="sr-frame absolute inset-x-0 top-1/2 block aspect-video -translate-y-1/2 overflow-hidden bg-espresso md:inset-0 md:top-0 md:aspect-auto md:translate-y-0"
      >
        <video className="sr-media absolute inset-0 h-full w-full object-cover" data-src={asset("/video/reel-loop.mp4")} poster={asset("/video/reel-loop.jpg")} muted loop playsInline preload="none" />
        <span className="sr-shade absolute inset-0 bg-espresso/35" />
        {/* safe-area guides */}
        {["left-[6%] top-[10%] border-l-2 border-t-2", "right-[6%] top-[10%] border-r-2 border-t-2", "left-[6%] bottom-[10%] border-b-2 border-l-2", "right-[6%] bottom-[10%] border-b-2 border-r-2"].map((c) => (
          <span key={c} className={`sr-guide absolute h-6 w-6 border-cream/80 md:h-12 md:w-12 ${c}`} />
        ))}
        <span className="absolute inset-0 grid place-items-center px-4">
          <span className="text-center">
            <span className="block font-display text-[clamp(2.2rem,10vw,10rem)] font-bold leading-[1] tracking-[-0.045em] text-cream" aria-hidden>
              {TITLE.split("").map((c, i) => (
                <span key={i} className="sr-ch inline-block whitespace-pre">{c}</span>
              ))}
            </span>
            <span className="sr-hint mt-6 inline-flex translate-y-3 items-center gap-3 rounded-full bg-saffron px-5 py-3 text-[15px] font-medium text-espresso opacity-0">
              <svg width="10" height="11" viewBox="0 0 9 10" aria-hidden><path d="M0 0l9 5-9 5z" fill="currentColor" /></svg>
              Play with sound, 0:48
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}
