"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { CATEGORIES, type Project } from "@/content/site";
import { useVideoModal } from "../VideoModal";
import VideoThumb from "../VideoThumb";
import SectionHead from "./SectionHead";

export default function Work({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string>("All");
  const grid = useRef<HTMLDivElement>(null);
  const open = useVideoModal();
  const cats = useMemo(() => ["All", ...CATEGORIES.filter((c) => projects.some((p) => p.category === c)), ...Array.from(new Set(projects.map((p) => p.category))).filter((c) => !(CATEGORIES as readonly string[]).includes(c))], [projects]);
  const list = filter === "All" ? projects : projects.filter((p) => p.category === filter);
  const longs = list.filter((p) => p.orientation !== "portrait");
  const shorts = list.filter((p) => p.orientation === "portrait");
  const first = useRef(true);

  useEffect(() => {
    const items = grid.current!.querySelectorAll(".work-item");
    if (first.current) {
      first.current = false;
      const ctx = gsap.context(() => {
        gsap.from(items, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: grid.current, start: "top 85%" } });
      });
      return () => ctx.revert();
    }
    gsap.fromTo(items, { y: 30, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "expo.out", stagger: 0.05, onComplete: () => ScrollTrigger.refresh() });
  }, [filter]);

  return (
    <section id="work" className="relative py-24 md:py-36">
      <div className="wrap">
        <SectionHead
          lines={["Selected work"]}
          aside={<p>Ten pieces, split by format. Hover a card for a silent preview, click to watch it with sound.</p>}
        />

        <div className="mt-10 flex flex-wrap gap-2 md:mt-14" role="tablist" aria-label="Filter projects">
          {cats.map((c) => {
            const n = c === "All" ? projects.length : projects.filter((p) => p.category === c).length;
            const active = filter === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(c)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${active ? "border-lime bg-lime text-bg" : "border-line bg-card text-fg/70 hover:border-fg/30 hover:text-fg"}`}
              >
                {c}
                <span className={`label !text-[10px] ${active ? "text-bg/60" : "text-muted"}`}>{String(n).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>

        <div ref={grid} className="mt-10 space-y-14 md:space-y-20">
          {longs.length > 0 && (
            <div>
              <GroupLabel label="Long-form" sub="16:9 · YouTube & web" count={longs.length} />
              <div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2">
                {longs.map((p, i) => (
                  <Card key={p.id} p={p} idx={projects.indexOf(p) + 1} feature={longs.length % 2 === 1 && i === 0} onOpen={open} />
                ))}
              </div>
            </div>
          )}
          {shorts.length > 0 && (
            <div>
              <GroupLabel label="Shorts & Reels" sub="9:16 · Reels / Shorts" count={shorts.length} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 md:gap-x-5">
                {shorts.map((p) => (
                  <Card key={p.id} p={p} idx={projects.indexOf(p) + 1} onOpen={open} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GroupLabel({ label, sub, count }: { label: string; sub: string; count: number }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-4">
      <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
        {label} <span className="label align-middle text-muted">{String(count).padStart(2, "0")}</span>
      </h3>
      <span className="label hidden text-muted sm:block">{sub}</span>
    </div>
  );
}

function Card({ p, idx, feature = false, onOpen }: { p: Project; idx: number; feature?: boolean; onOpen: ReturnType<typeof useVideoModal> }) {
  const portrait = p.orientation === "portrait";
  return (
    <article className={`work-item group min-w-0 ${feature ? "md:col-span-2" : ""}`}>
      <button
        type="button"
        data-cursor="play"
        onClick={() => onOpen({ id: p.youtubeId, title: p.title, orientation: p.orientation })}
        className={`relative block w-full overflow-hidden rounded-[20px] border border-line bg-card text-left transition-[border-color,box-shadow] duration-500 group-hover:border-lime/60 group-hover:shadow-[0_30px_60px_-30px_rgba(70,52,30,0.45)] ${portrait ? "aspect-[9/16]" : feature ? "aspect-video md:aspect-[21/9]" : "aspect-video"}`}
        aria-label={`Play ${p.title}`}
      >
        <VideoThumb id={p.youtubeId} title={p.title} quality={feature ? "maxres" : "hq"} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <span className="label pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] text-white/85 md:left-4 md:top-4">{p.category}</span>
        <span className="label pointer-events-none absolute right-3 top-3 text-[10px] text-white/75 md:right-4 md:top-4">{String(idx).padStart(2, "0")}</span>
        {!portrait && <p className="pointer-events-none absolute inset-x-4 bottom-4 max-w-md translate-y-3 text-sm leading-relaxed text-white/90 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{p.description}</p>}
      </button>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h4 className={`font-semibold leading-snug tracking-tight ${portrait ? "text-base md:text-lg" : "text-xl md:text-2xl"}`}>{p.title}</h4>
          <div className="label mt-1.5 text-lime">{p.client}</div>
        </div>
        {!portrait && (
          <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-sm transition-all duration-500 group-hover:rotate-45 group-hover:border-lime group-hover:bg-lime group-hover:text-bg" aria-hidden>↗</span>
        )}
      </div>
      <dl className="mt-3 flex flex-wrap gap-1.5 px-1">
        {!portrait && <div className="label rounded-full border border-line px-2.5 py-1 !text-[10px] text-fg/60"><dt className="sr-only">Platform</dt><dd>{p.platform}</dd></div>}
        <div className="label rounded-full border border-line px-2.5 py-1 !text-[10px] text-fg/60"><dt className="sr-only">Role</dt><dd>{p.role}</dd></div>
      </dl>
    </article>
  );
}
