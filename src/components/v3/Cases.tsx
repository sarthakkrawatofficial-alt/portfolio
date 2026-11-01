"use client";
import { gsap, EASE, reducedMotion, isMobile } from "@/lib/gsap";
import { CASES } from "@/content/cases";
import { asset } from "@/lib/asset";
import { useGsap } from "./useGsap";
import Panel from "./Panel";
import SectionLabel from "./SectionLabel";
import Split from "./Split";

/** SC15: pinned; three case studies slide sideways as you scroll, each title assembles as its panel arrives. Phones get a swipe rail. */
export default function Cases() {
  const ref = useGsap<HTMLDivElement>((el, q) => {
    if (reducedMotion() || isMobile()) return;
    const track = q(".cs-track")[0];
    const dist = () => track.scrollWidth - window.innerWidth + 80;
    const slide = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    q(".cs-panel").forEach((p) => {
      const chars = p.querySelectorAll(".ch");
      gsap.set(chars, { yPercent: 110 });
      gsap.to(chars, { yPercent: 0, duration: 0.8, ease: EASE.settle, stagger: 0.02, scrollTrigger: { trigger: p, containerAnimation: slide, start: "left 75%", once: true } });
      gsap.fromTo(p.querySelector("img"), { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: p, containerAnimation: slide, start: "left right", end: "right left", scrub: true } });
    });
  });

  return (
    <Panel id="cases" className="bg-cream-dp">
      <div ref={ref} className="relative overflow-hidden py-24 md:flex md:h-[100svh] md:flex-col md:justify-center md:pb-8 md:pt-24">
        <div className="wrap">
          <SectionLabel sc="15" time="00:31" className="mb-6" />
          <h2 className="font-display text-[clamp(2.4rem,5vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.045em]">How three of these got made</h2>
        </div>
        <div className="cs-track mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mt-14 md:snap-none md:gap-8 md:overflow-visible md:pl-10 md:pr-10">
          {CASES.map((c, i) => (
            <a key={c.id} href={asset(`/case-studies/#${c.id}`)} data-transition data-cursor="link" className="cs-panel group w-[84vw] shrink-0 snap-start md:w-[min(52vw,calc((100svh-330px)*16/9))] md:max-w-[900px]">
              <div className="relative aspect-video overflow-hidden rounded-[22px] bg-espresso">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(c.images[0])} alt={`${c.title}, still frame`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <span className="tnum absolute left-4 top-4 rounded-full bg-cream px-3 py-1 text-[13px] font-medium text-espresso">{`${i + 1} of ${CASES.length}`}</span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-12 md:gap-8">
                <h3 className="font-display text-[26px] font-bold leading-tight tracking-[-0.03em] md:col-span-6 md:text-[34px]" aria-label={c.title}>
                  <span aria-hidden><Split text={c.title} /></span>
                </h3>
                <div className="md:col-span-6">
                  <p className="text-[16px] leading-relaxed text-espresso/75">{c.summary}</p>
                  <span className="mt-3 inline-block border-b border-espresso pb-0.5 text-[15px] font-medium">Read the case study</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Panel>
  );
}
