"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import { reelChapters, ytThumb, type Orientation, type Project, type Settings, type Stat } from "@/content/site";
import { useVideoModal } from "../VideoModal";
import SectionHead from "./SectionHead";

/* ------------------------------------------------------------------------------------------
   A self-playing showreel. Everything sits on a fixed stage (1600×900, or 900×1400 on phones)
   scaled to fit, and one GSAP timeline cuts it: slate → name → word flashes → one chapter per
   kind of work (each opens on an accent card) → clients → numbers → end card.
   Videos are YouTube embeds, mounted a few seconds before their shot and removed after it.
------------------------------------------------------------------------------------------- */

type Shot = { youtubeId: string; client: string; title: string; role: string; orientation: Orientation; start: number };
type Box = { x: number; y: number; w: number; h: number };

const LAND = { w: 1600, h: 900 };
const PORT = { w: 900, h: 1400 };
const FPS = 24;
const T = { shot: 3.2, group: 4.6, card: 1.5, wipe: 0.65 };

// where frames sit on the stage, per layout
function slots(portrait: boolean) {
  if (portrait) {
    return {
      single: { x: 40, y: 420, w: 820, h: 461 } as Box,
      trio: [0, 1, 2].map((i) => ({ x: 40 + i * 280, y: 400, w: 260, h: 462 })) as Box[],
      metaY: 920,
      topY: 320,
    };
  }
  return {
    single: { x: 200, y: 100, w: 1200, h: 675 } as Box,
    trio: [0, 1, 2].map((i) => ({ x: 265 + i * 370, y: 110, w: 330, h: 587 })) as Box[],
    metaY: 800,
    topY: 52,
  };
}

const embed = (s: Shot) => {
  const p = new URLSearchParams({
    autoplay: "1", mute: "1", controls: "0", playsinline: "1", rel: "0", modestbranding: "1",
    loop: "1", playlist: s.youtubeId, start: String(s.start), enablejsapi: "1", iv_load_policy: "3", disablekb: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${s.youtubeId}?${p.toString()}`;
};

const tc = (t: number) => {
  const f = Math.floor(t * FPS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:${pad(Math.floor(f / FPS / 60))}:${pad(Math.floor(f / FPS) % 60)}:${pad(f % FPS)}`;
};

export default function Showreel({ settings, projects, stats, clients }: { settings: Settings; projects: Project[]; stats: Stat[]; clients: string[] }) {
  const openVideo = useVideoModal();
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const sound = useRef(false);
  const audible = useRef(-1);

  const [portrait, setPortrait] = useState(false);
  const [scale, setScale] = useState(1);
  const [state, setState] = useState<"cover" | "playing" | "paused" | "ended">("cover");
  const [soundOn, setSoundOn] = useState(false);
  const [marks, setMarks] = useState<{ at: number; label: string }[]>([]);

  const S = portrait ? PORT : LAND;
  const L = slots(portrait);

  // resolve chapters → flat shot list with chapter/group bookkeeping
  const chapters = useMemo(() => {
    let n = 0;
    return reelChapters.map((c) => ({
      ...c,
      shots: c.shots.flatMap((s) => {
        const p = s.project ? projects.find((x) => x.id === s.project) : undefined;
        const id = s.youtubeId ?? p?.youtubeId;
        if (!id) return [];
        const shot: Shot = {
          youtubeId: id,
          client: s.client ?? p?.client ?? "",
          title: s.title ?? p?.title ?? "",
          role: s.role ?? p?.role ?? "",
          orientation: s.orientation ?? p?.orientation ?? "landscape",
          start: s.start ?? 0,
        };
        return [{ ...shot, n: n++ }];
      }),
    }));
  }, [projects]);
  const allShots = chapters.flatMap((c) => c.shots);
  const cover = allShots.find((s) => s.orientation === "landscape") ?? allShots[0];
  const reelStats = stats.slice(0, 3);
  const reelClients = clients.slice(0, 8);

  // fit the stage to its box; switch to the tall stage on narrow screens
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const p = window.innerWidth < 640;
      setPortrait(p);
      setScale(el.clientWidth / (p ? PORT.w : LAND.w));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // scroll-in scale on the whole player, as before
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(box.current, { scale: 0.88, borderRadius: 48 }, {
        scale: 1, borderRadius: 28, ease: "none",
        scrollTrigger: { trigger: box.current, start: "top bottom", end: "center center", scrub: true },
      });
      gsap.to(".reel-ring", { rotate: 360, duration: 14, ease: "none", repeat: -1 });
    }, root);
    return () => ctx.revert();
  }, []);

  /* ---------- embedded players ---------- */
  const frameMedia = (n: number) => stage.current?.querySelector<HTMLDivElement>(`.r-media-${n}`) ?? null;
  const player = (n: number) => frameMedia(n)?.querySelector("iframe") ?? null;
  const cmd = (n: number, func: string, args: unknown[] = []) =>
    player(n)?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");

  const mount = useCallback((n: number) => {
    const m = frameMedia(n);
    const s = allShots[n];
    if (!m || !s || m.querySelector("iframe")) return;
    const f = document.createElement("iframe");
    f.src = embed(s);
    f.title = `${s.client} — ${s.title}`;
    f.allow = "autoplay; encrypted-media";
    f.tabIndex = -1;
    f.className = "absolute inset-0 h-full w-full scale-[1.16] pointer-events-none";
    m.appendChild(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allShots]);
  const unmount = (n: number) => frameMedia(n)?.replaceChildren();
  const unmountAll = () => allShots.forEach((s) => unmount(s.n));

  const hear = (n: number) => {
    if (audible.current >= 0 && audible.current !== n) cmd(audible.current, "mute");
    audible.current = n;
    cmd(n, "seekTo", [allShots[n].start, true]);
    cmd(n, "playVideo");
    if (sound.current) { cmd(n, "unMute"); cmd(n, "setVolume", [80]); }
  };

  /* ---------- the cut ---------- */
  const build = useCallback(() => {
    tl.current?.kill();
    unmountAll();
    audible.current = -1;
    const q = gsap.utils.selector(stage);
    const t = gsap.timeline({
      paused: true,
      defaults: { ease: "expo.out" },
      onUpdate() {
        if (tcRef.current) tcRef.current.textContent = tc(this.time());
        if (barRef.current) barRef.current.style.transform = `scaleX(${this.progress()})`;
      },
      onComplete: () => setState("ended"),
    });
    const chapterMarks: { at: number; label: string }[] = [];
    let z = 10;

    // reset everything
    t.set(q(".r-layer"), { autoAlpha: 0 }, 0);
    t.set(q(".r-frame"), { autoAlpha: 0, clipPath: "inset(0% 0% 0% 0%)", y: 0 }, 0);
    t.set(q(".r-meta"), { autoAlpha: 0, y: 24 }, 0);
    t.set(q(".r-edge"), { autoAlpha: 0 }, 0);

    // 1 — slate: film-leader countdown
    chapterMarks.push({ at: 0, label: "Open" });
    t.set(q(".r-slate"), { autoAlpha: 1 }, 0);
    t.fromTo(q(".r-slate-meta"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.1);
    [3, 2, 1].forEach((d, i) => {
      const at = 0.2 + i * 0.75;
      t.set(q(".r-count"), { autoAlpha: 0 }, at);
      t.set(q(`.r-count-${d}`), { autoAlpha: 1 }, at);
      t.fromTo(q(".r-sweep"), { strokeDashoffset: 0 }, { strokeDashoffset: -1131, duration: 0.75, ease: "none" }, at);
    });
    t.set(q(".r-slate"), { autoAlpha: 0 }, 2.5);

    // 2 — name
    t.set(q(".r-name"), { autoAlpha: 1 }, 2.5);
    t.fromTo(q(".r-name-line"), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.09 }, 2.55);
    t.fromTo(q(".r-name-sub"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 3.1);
    t.fromTo(q(".r-name-rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.inOut" }, 2.9);
    t.to(q(".r-name-line"), { yPercent: -110, duration: 0.5, ease: "power3.in", stagger: 0.05 }, 5);
    t.to(q(".r-name-sub, .r-name-rule"), { autoAlpha: 0, duration: 0.3 }, 5);
    t.set(q(".r-name"), { autoAlpha: 0 }, 5.6);

    // 3 — four words, hard cuts on the beat
    const words = q(".r-word");
    words.forEach((w, i) => {
      const at = 5.6 + i * 0.4;
      t.set(q(".r-flash"), { autoAlpha: 1 }, at);
      t.set(words, { autoAlpha: 0 }, at);
      t.set(w, { autoAlpha: 1 }, at);
      t.fromTo(w, { scale: 1.08 }, { scale: 1, duration: 0.4, ease: "power2.out" }, at);
    });
    let at = 5.6 + words.length * 0.4;
    t.set(q(".r-flash"), { autoAlpha: 0 }, at);

    // 4 — chapters
    chapters.forEach((c, ci) => {
      chapterMarks.push({ at, label: c.title });
      const card = q(`.r-chap-${ci}`);
      // accent card wipes up, holds, wipes off upward revealing the first shot
      t.set(card, { autoAlpha: 1, zIndex: 50 }, at);
      t.fromTo(card, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "expo.inOut" }, at);
      t.fromTo(q(`.r-chap-${ci} .r-chap-in`), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07 }, at + 0.3);
      const out = at + T.card - 0.5;
      t.set(q(".r-chapter"), { autoAlpha: 0 }, out);
      t.set(q(`.r-ch-${ci}`), { autoAlpha: 1 }, out);
      t.to(card, { yPercent: -100, duration: 0.55, ease: "expo.inOut" }, out);
      t.set(card, { autoAlpha: 0 }, out + 0.6);
      at = out + 0.05;

      const top = q(`.r-ch-${ci} .r-top-count`)[0];
      const groups = c.layout === "trio" ? Array.from({ length: Math.ceil(c.shots.length / 3) }, (_, g) => c.shots.slice(g * 3, g * 3 + 3)) : c.shots.map((s) => [s]);

      groups.forEach((g, gi) => {
        g.forEach((s) => t.call(mount, [s.n], Math.max(0, at - 3.5)));
        if (top) t.call(() => { top.textContent = `${String(gi + 1).padStart(2, "0")} / ${String(groups.length).padStart(2, "0")}`; }, [], at);
        const first = gi === 0;
        g.forEach((s, k) => {
          const f = q(`.r-frame-${s.n}`);
          const d = c.layout === "trio" ? k * 0.14 : 0;
          t.set(f, { autoAlpha: 1, zIndex: ++z }, at + d);
          if (first) {
            t.fromTo(f, { y: 40, clipPath: "inset(100% 0% 0% 0%)" }, { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.out" }, at + d);
          } else {
            // wipe the next shot in over the last one, a thin accent edge riding the cut
            t.fromTo(f, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.wipe, ease: "power4.inOut" }, at + d);
            const b = c.layout === "trio" ? L.trio[k] : L.single;
            const edge = q(`.r-edge-${c.layout === "trio" ? k : 0}`);
            t.set(edge, { autoAlpha: 1, zIndex: z + 1, top: b.y, height: b.h }, at + d);
            t.fromTo(edge, { x: b.x + b.w }, { x: b.x - 4, duration: T.wipe, ease: "power4.inOut" }, at + d);
            t.set(edge, { autoAlpha: 0 }, at + d + T.wipe);
          }
          t.call(hear, [s.n], at + d + (c.layout === "trio" && k > 0 ? 0.01 : 0));
          // captions
          t.to(q(`.r-meta-${s.n}`), { autoAlpha: 1, y: 0, duration: 0.6 }, at + d + 0.25);
        });
        // in a trio, only the first short in the group is heard
        if (c.layout === "trio") t.call(hear, [g[0].n], at + 0.3);
        const len = c.layout === "trio" ? T.group : T.shot;
        const end = at + len;
        // caption out just before the cut; old frames hidden once they're covered
        g.forEach((s) => {
          t.to(q(`.r-meta-${s.n}`), { autoAlpha: 0, y: -16, duration: 0.3, ease: "power2.in" }, end - 0.3);
          t.set(q(`.r-frame-${s.n}`), { autoAlpha: 0 }, end + T.wipe + 0.4);
          t.call(unmount, [s.n], end + T.wipe + 0.5);
        });
        at = end;
      });
      t.set(q(`.r-ch-${ci}`), { autoAlpha: 0 }, at);
    });
    // last chapter's final frame leaves with the clients beat
    const lastShots = q(".r-frame");
    t.to(lastShots, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, at);

    // 5 — clients, flashed on the beat, then the full list settles
    chapterMarks.push({ at, label: "Clients" });
    t.set(q(".r-clients"), { autoAlpha: 1 }, at);
    t.fromTo(q(".r-clients-eyebrow"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at);
    const names = q(".r-client");
    names.forEach((nm, i) => t.fromTo(nm, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at + 0.2 + i * 0.16));
    at += 0.2 + names.length * 0.16 + 1.4;
    t.to(q(".r-clients"), { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, at);
    at += 0.4;

    // 6 — numbers roll to target
    chapterMarks.push({ at, label: "Numbers" });
    t.set(q(".r-stats"), { autoAlpha: 1 }, at);
    q(".r-stat").forEach((el, i) => {
      const v = reelStats[i];
      const num = el.querySelector<HTMLElement>(".r-stat-num")!;
      const o = { v: 0 };
      t.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8 }, at + i * 0.15);
      t.to(o, { v: v.value, duration: 1.3, ease: "power3.out", onUpdate: () => { num.textContent = Math.round(o.v) + v.suffix; } }, at + i * 0.15);
    });
    at += 3.2;
    t.to(q(".r-stats"), { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, at);
    at += 0.4;

    // 7 — end card
    chapterMarks.push({ at, label: "Contact" });
    t.set(q(".r-end"), { autoAlpha: 1 }, at);
    t.fromTo(q(".r-end-line"), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.1 }, at);
    t.fromTo(q(".r-end-sub"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, at + 0.5);
    t.to({}, { duration: 1.6 }, at + 1.2);

    tl.current = t;
    const total = t.duration();
    setMarks(chapterMarks.map((m) => ({ ...m, at: m.at / total })));
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, L, mount, reelStats]);

  useEffect(() => () => { tl.current?.kill(); }, []);
  // a resize across the phone breakpoint changes the stage, so go back to the cover
  useEffect(() => { tl.current?.kill(); tl.current = null; unmountAll(); setState("cover"); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [portrait]);

  const play = () => { build().play(0); setState("playing"); };
  const toggle = () => {
    const t = tl.current;
    if (!t) return play();
    if (state === "ended") return play();
    if (t.paused()) { t.play(); allShots.forEach((s) => cmd(s.n, "playVideo")); setState("playing"); }
    else { t.pause(); allShots.forEach((s) => cmd(s.n, "pauseVideo")); setState("paused"); }
  };
  const toggleSound = () => {
    sound.current = !sound.current;
    setSoundOn(sound.current);
    if (audible.current >= 0) {
      if (sound.current) { cmd(audible.current, "unMute"); cmd(audible.current, "setVolume", [80]); }
      else cmd(audible.current, "mute");
    }
  };

  const first = settings.name.split(" ")[0];
  const last = settings.name.split(" ").slice(1).join(" ");
  const meta = (s: Shot) => (
    <>
      <span className="text-white">{s.client}</span>
      <span className="text-white/35"> · </span>
      <span className="text-white/70">{s.title}</span>
      <span className="text-white/35"> · </span>
      <span className="text-white/50">{s.role}</span>
    </>
  );

  return (
    <section ref={root} id="showreel" className="tex relative py-24 md:py-36">
      <div aria-hidden className="tex-layer tex-glow" />
      <div aria-hidden className="tex-layer tex-grain" />
      <div className="wrap">
        <SectionHead
          index="01"
          label="Showreel 2025"
          lines={["Fifty seconds.", { text: "No explanations.", className: "text-fg/35" }]}
          aside={<p>SaaS launches, short-form, trailers and docs — cut into one reel so you can feel how I pace a story. Sound is off until you want it.</p>}
        />
      </div>

      <div className="mx-auto mt-12 w-full max-w-[1600px] px-3 md:mt-16 md:px-6">
        <div
          ref={box}
          className="relative w-full overflow-hidden border border-line bg-[#070707] text-white"
          style={{ borderRadius: 28, aspectRatio: `${S.w} / ${S.h}` }}
        >
          {/* ---------------- stage ---------------- */}
          <div ref={stage} aria-hidden={state === "cover"} className="absolute left-0 top-0 origin-top-left overflow-hidden" style={{ width: S.w, height: S.h, transform: `scale(${scale})` }}>
            {/* slate */}
            <div className="r-layer r-slate invisible absolute inset-0 grid place-items-center">
              <svg width="420" height="420" viewBox="0 0 420 420" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <circle cx="210" cy="210" r="180" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
                <circle className="r-sweep" cx="210" cy="210" r="180" fill="none" stroke="var(--color-lime)" strokeWidth="3" strokeDasharray="1131" transform="rotate(-90 210 210)" />
                <line x1="210" y1="0" x2="210" y2="420" stroke="rgba(255,255,255,.08)" />
                <line x1="0" y1="210" x2="420" y2="210" stroke="rgba(255,255,255,.08)" />
              </svg>
              {[3, 2, 1].map((d) => (
                <span key={d} className={`r-count r-count-${d} invisible absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[220px] font-semibold leading-none tracking-tighter`}>{d}</span>
              ))}
              <div className="label absolute left-12 flex flex-col gap-1 text-white/60" style={{ top: portrait ? 140 : 48, fontSize: portrait ? 28 : 18 }}>
                <span className="r-slate-meta">SR — Showreel 2025</span>
                <span className="r-slate-meta text-white/35">Take 07 · {FPS} fps</span>
              </div>
              <div className="label absolute bottom-12 right-12 text-right text-[18px] text-white/35">
                <span className="r-slate-meta block">{settings.location}</span>
              </div>
            </div>

            {/* name */}
            <div className="r-layer r-name invisible absolute inset-0 flex flex-col justify-center" style={{ paddingInline: portrait ? 60 : 140 }}>
              <div className="h-display" style={{ fontSize: portrait ? 190 : 230 }}>
                <span className="block overflow-hidden pb-[0.08em]"><span className="r-name-line block">{first}</span></span>
                <span className="block overflow-hidden pb-[0.08em]"><span className="r-name-line block text-white/35">{last}</span></span>
              </div>
              <div className="r-name-rule mt-8 h-[3px] origin-left bg-lime" style={{ width: portrait ? 260 : 420 }} />
              <p className="r-name-sub label mt-6 text-white/70" style={{ fontSize: portrait ? 26 : 24 }}>{settings.role} · {settings.location}</p>
            </div>

            {/* word flashes */}
            <div className="r-layer r-flash invisible absolute inset-0">
              {["Edit.", "Motion.", "Story.", "Sound."].map((w, i) => (
                <div key={w} className={`r-word invisible absolute inset-0 grid place-items-center ${i === 2 ? "bg-lime text-[#0a0a0a]" : ""}`}>
                  <span className="h-display" style={{ fontSize: portrait ? 190 : 280 }}>{w}</span>
                </div>
              ))}
            </div>

            {/* chapter headers that stay up while a chapter plays */}
            {chapters.map((c, ci) => (
              <div key={c.title} className={`r-layer r-chapter r-ch-${ci} label invisible absolute flex items-center gap-4`} style={{ fontSize: portrait ? 28 : 18, left: portrait ? 40 : L.single.x, right: portrait ? 40 : S.w - L.single.x - L.single.w, top: L.topY }}>
                <span className="text-lime">{String(ci + 1).padStart(2, "0")}</span>
                <span className="h-px w-10 bg-white/25" />
                <span className="text-white/80">{c.title}</span>
                <span className="r-top-count ml-auto text-white/40" />
              </div>
            ))}

            {/* frames + captions */}
            {chapters.map((c) =>
              c.shots.map((s, k) => {
                const b = c.layout === "trio" ? L.trio[k % 3] : L.single;
                return (
                  <div key={s.n}>
                    <div className={`r-frame r-frame-${s.n} invisible absolute overflow-hidden bg-[#111]`} style={{ left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: c.layout === "trio" ? 22 : 18 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ytThumb(s.youtubeId, s.orientation === "landscape" ? "maxres" : "hq")} onError={(e) => ((e.currentTarget as HTMLImageElement).src = ytThumb(s.youtubeId))} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div className={`r-media-${s.n} absolute inset-0 overflow-hidden`} />
                      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
                    </div>
                    <div className={`r-meta r-meta-${s.n} label invisible absolute`} style={c.layout === "trio" ? { left: b.x, width: b.w, top: b.y + b.h + 22, fontSize: portrait ? 22 : 14 } : { left: b.x, right: S.w - b.x - b.w, top: L.metaY, fontSize: portrait ? 28 : 18 }}>
                      {c.layout === "trio" ? (
                        <><span className="block text-white">{s.client}</span><span className="block text-white/45">{s.role}</span></>
                      ) : meta(s)}
                    </div>
                  </div>
                );
              }),
            )}
            {/* accent edges riding the wipes (one per trio column; column 0 doubles for single shots) */}
            {[0, 1, 2].map((k) => <div key={k} className={`r-edge r-edge-${k} invisible absolute left-0 top-0 w-[4px] bg-lime`} />)}

            {/* chapter cards */}
            {chapters.map((c, ci) => (
              <div key={c.title} className={`r-layer r-chap-${ci} invisible absolute inset-0 flex flex-col justify-end bg-lime text-[#0a0a0a]`} style={{ padding: portrait ? 60 : 110 }}>
                <span className="r-chap-in label text-[22px] opacity-60">Chapter {String(ci + 1).padStart(2, "0")} · {c.shots.length} cuts</span>
                <span className="r-chap-in h-display mt-4" style={{ fontSize: portrait ? 130 : 190 }}>{c.title}</span>
              </div>
            ))}

            {/* clients */}
            <div className="r-layer r-clients invisible absolute inset-0 flex flex-col justify-center" style={{ paddingInline: portrait ? 60 : 140 }}>
              <span className="r-clients-eyebrow label text-[20px] text-lime">Cut for</span>
              <div className={`mt-8 grid items-end gap-x-16 gap-y-4 ${portrait ? "grid-cols-1" : "grid-cols-2"}`}>
                {reelClients.map((n) => (
                  <span key={n} className="r-client h-display block" style={{ fontSize: portrait ? 56 : 58 }}>{n}</span>
                ))}
              </div>
            </div>

            {/* numbers */}
            <div className="r-layer r-stats invisible absolute inset-0 flex items-center" style={{ paddingInline: portrait ? 60 : 140 }}>
              <div className={`grid w-full ${portrait ? "grid-cols-1 gap-16" : "grid-cols-3 gap-10"}`}>
                {reelStats.map((s) => (
                  <div key={s.label} className="r-stat border-t border-white/15 pt-6">
                    <span className="r-stat-num h-display block" style={{ fontSize: portrait ? 170 : 150 }}>0{s.suffix}</span>
                    <span className="label mt-3 block text-[20px] text-white/55">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* end card */}
            <div className="r-layer r-end invisible absolute inset-0 flex flex-col justify-center" style={{ paddingInline: portrait ? 60 : 140 }}>
              <div className="h-display" style={{ fontSize: portrait ? 120 : 150 }}>
                <span className="block overflow-hidden pb-[0.08em]"><span className="r-end-line block">Let&apos;s make something</span></span>
                <span className="block overflow-hidden pb-[0.08em]"><span className="r-end-line block text-lime">people finish.</span></span>
              </div>
              <p className="r-end-sub label mt-10 text-[24px] text-white/80">{settings.email}</p>
              <p className="r-end-sub label mt-2 text-[20px] text-white/40">{settings.instagramHandle} · {settings.role}</p>
            </div>
          </div>

          {/* ---------------- HUD (real-size, outside the scaled stage) ---------------- */}
          {state !== "cover" && (
            <>
              <div className="label pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 text-white/70 md:left-6 md:top-5">
                <span className="h-2 w-2 rounded-full bg-lime" style={{ animation: state === "playing" ? "blink 1.2s steps(2) infinite" : "none" }} />
                <span ref={tcRef}>00:00:00:00</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 md:gap-3 md:px-5 md:pb-4">
                <button type="button" onClick={toggle} className="label grid h-9 min-w-9 place-items-center rounded-full border border-white/20 bg-black/50 px-3 text-white hover:border-lime hover:text-lime" aria-label={state === "playing" ? "Pause showreel" : "Play showreel"}>
                  {state === "playing" ? "❚❚" : state === "ended" ? "↺" : "▶"}
                </button>
                <button type="button" onClick={toggleSound} className="label h-9 rounded-full border border-white/20 bg-black/50 px-3 text-white hover:border-lime hover:text-lime" aria-pressed={soundOn}>
                  {soundOn ? "Sound on" : "Sound off"}
                </button>
                <div className="relative mx-1 h-[3px] flex-1 overflow-visible rounded-full bg-white/15">
                  <div ref={barRef} className="absolute inset-0 origin-left rounded-full bg-lime" style={{ transform: "scaleX(0)" }} />
                  {marks.map((m) => (
                    <span key={m.label} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-white/50" style={{ left: `${m.at * 100}%` }} title={m.label} />
                  ))}
                </div>
                {state === "ended" && (
                  <a href="#contact" className="label hidden h-9 items-center rounded-full bg-lime px-4 font-semibold text-[#0a0a0a] sm:inline-flex">Get in touch</a>
                )}
              </div>
            </>
          )}

          {/* ---------------- cover ---------------- */}
          {state === "cover" && cover && (
            <button type="button" data-cursor="play" onClick={play} className="group absolute inset-0 z-30 h-full w-full text-left" aria-label="Play showreel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ytThumb(cover.youtubeId, "maxres")} onError={(e) => ((e.currentTarget as HTMLImageElement).src = ytThumb(cover.youtubeId))} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition-opacity duration-700 group-hover:opacity-60" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(7,7,7,0.9)_100%)]" />
              <div className="label absolute left-4 top-4 flex items-center gap-2 text-white/80 md:left-8 md:top-7">
                <span className="h-2 w-2 rounded-full bg-lime" style={{ animation: "blink 1.2s steps(2) infinite" }} /> Showreel 2025
              </div>
              <div className="label absolute right-4 top-4 hidden text-white/55 sm:block md:right-8 md:top-7">
                {chapters.map((c) => c.title).join(" · ")}
              </div>
              <div className="absolute bottom-5 left-4 md:bottom-8 md:left-8">
                <p className="h-display text-4xl text-white sm:text-5xl md:text-7xl">{settings.name}</p>
                <p className="label mt-2 text-white/60 md:mt-3">{settings.role} · {allShots.length} projects · ≈ 50s</p>
              </div>
              <span className="absolute left-1/2 top-1/2 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center md:h-48 md:w-48">
                <svg className="reel-ring absolute inset-0 h-full w-full" viewBox="0 0 200 200" aria-hidden>
                  <defs><path id="circ" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" /></defs>
                  <text fill="#F2F2F2" fontSize="13" fontFamily="var(--font-mono)">
                    <textPath href="#circ" textLength="512" lengthAdjust="spacing">PLAY SHOWREEL · 2025 · PLAY SHOWREEL · 2025 · </textPath>
                  </text>
                </svg>
                <span className="grid h-16 w-16 place-items-center rounded-full bg-lime text-bg shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 md:h-24 md:w-24">
                  <svg width="22" height="22" viewBox="0 0 10 10" className="translate-x-0.5"><path d="M1 0l9 5-9 5z" fill="currentColor" /></svg>
                </span>
              </span>
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="label text-muted">Plays in sequence · YouTube embeds · press play, then turn sound on</p>
          <button type="button" onClick={() => openVideo({ id: settings.showreelId, title: `${settings.name} — Full showreel` })} className="label rounded-full border border-line px-4 py-2.5 text-fg hover:border-lime hover:text-lime">
            Watch the full 2-min cut ↗
          </button>
        </div>
      </div>
    </section>
  );
}
