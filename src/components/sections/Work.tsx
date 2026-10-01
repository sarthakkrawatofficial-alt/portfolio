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
          index="02"
          label="Selected work"
          lines={["Selected", { text: "work.", className: "text-lime" }]}
          aside={<p>Product launches, explainers, trailers and reels — each one cut for the platform it lives on. Hover to preview, click to watch.</p>}
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
                className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${active ? "border-lime bg-lime text-bg" : "border-line bg-white/[0.02] text-fg/70 hover:border-fg/30 hover:text-fg"}`}
              >
                {c}
                <span className={`label !text-[10px] ${active ? "text-bg/60" : "text-muted"}`}>{String(n).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>

        <div ref={grid} className="mt-8 flex flex-wrap gap-x-4 gap-y-8 md:gap-x-5 md:gap-y-12">
          {list.map((p) => {
            const ar = p.orientation === "portrait" ? 9 / 16 : 16 / 9;
            const idx = projects.indexOf(p) + 1;
            return (
              <article key={p.id} className="work-item group min-w-0" style={{ flexGrow: ar, flexBasis: `${ar * 230}px` }}>
                <button type="button" data-cursor="play" onClick={() => open({ id: p.youtubeId, title: p.title, orientation: p.orientation })} className="relative block w-full overflow-hidden rounded-[22px] border border-line bg-card text-left transition-[border-color,box-shadow] duration-500 group-hover:border-lime/60 group-hover:shadow-[0_30px_80px_-30px_rgba(200,255,46,0.45)]" style={{ paddingBottom: `${100 / ar}%` }} aria-label={`Play ${p.title}`}>
                  <VideoThumb id={p.youtubeId} title={p.title} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <span className="label pointer-events-none absolute left-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-fg/85 backdrop-blur">{p.category}</span>
                  <span className="label pointer-events-none absolute right-4 top-4 text-[10px] text-fg/60">{String(idx).padStart(2, "0")}</span>
                  {p.orientation === "landscape" && <p className="pointer-events-none absolute inset-x-4 bottom-4 max-w-md translate-y-3 text-sm leading-snug text-fg/85 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{p.description}</p>}
                </button>
                <div className="mt-4 flex items-start justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold leading-tight tracking-tight md:text-2xl">{p.title}</h3>
                    <div className="label mt-2 text-lime">{p.client}</div>
                  </div>
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-sm transition-all duration-500 group-hover:rotate-45 group-hover:border-lime group-hover:bg-lime group-hover:text-bg" aria-hidden>↗</span>
                </div>
                <dl className="mt-3 flex flex-wrap gap-1.5 px-1">
                  <div className="label rounded-full border border-line px-2.5 py-1 !text-[10px] text-fg/60"><dt className="sr-only">Platform</dt><dd>{p.platform}</dd></div>
                  <div className="label rounded-full border border-line px-2.5 py-1 !text-[10px] text-fg/60"><dt className="sr-only">Role</dt><dd>{p.role}</dd></div>
                </dl>
              </article>
            );
          })}
          {/* filler keeps the last row from over-stretching */}
          <div aria-hidden style={{ flexGrow: 10, flexBasis: 0 }} />
        </div>
      </div>
    </section>
  );
}
