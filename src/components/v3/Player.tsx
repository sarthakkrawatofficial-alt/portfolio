"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { gsap, EASE, reducedMotion } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";
import { ytEmbed, type Orientation } from "@/content/site";
import YtImg from "./YtImg";

type Video = { id: string; title: string; orientation?: Orientation; from?: HTMLElement | null };
type Open = (v: Video) => void;
const Ctx = createContext<Open>(() => {});
export const usePlayer = () => useContext(Ctx);

/** SC14: the clicked card grows into the player (shared element) and shrinks back into it on close. */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [ready, setReady] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const open = useCallback<Open>((v) => { closing.current = false; setReady(false); setVideo(v); }, []);

  const target = (portrait: boolean) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    let w = Math.min(vw * 0.92, 1280), h = w * (portrait ? 16 / 9 : 9 / 16);
    if (h > vh * 0.86) { h = vh * 0.86; w = h * (portrait ? 9 / 16 : 16 / 9); }
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  };
  const fromRect = (el?: HTMLElement | null) => {
    const r = el?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  };
  // FLIP: the frame always sits at its final rect; the card's rect is expressed as a transform on it
  const asTransform = (r: { left: number; top: number; width: number; height: number }, t: ReturnType<typeof target>) => ({
    x: r.left - t.left, y: r.top - t.top, scaleX: r.width / t.width, scaleY: r.height / t.height,
  });

  const close = useCallback(() => {
    if (!video || closing.current) return;
    closing.current = true;
    setReady(false);
    const r = fromRect(video.from);
    const done = () => { setVideo(null); scrollState.lenis?.start(); };
    if (reducedMotion() || !r) { gsap.to(shell.current, { autoAlpha: 0, duration: 0.3, onComplete: done }); return; }
    gsap.to(back.current, { autoAlpha: 0, duration: 0.45, ease: EASE.wipe });
    const t = target(video.orientation === "portrait");
    gsap.to(frame.current, { ...asTransform(r, t), duration: 0.55, ease: EASE.wipe, onComplete: done });
  }, [video]);

  useEffect(() => {
    if (!video) return;
    scrollState.lenis?.stop();
    const portrait = video.orientation === "portrait";
    const t = target(portrait);
    const r = fromRect(video.from);
    gsap.set(frame.current, { ...t, transformOrigin: "0 0", borderRadius: 24 });
    if (reducedMotion() || !r) {
      gsap.fromTo(shell.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, onComplete: () => setReady(true) });
    } else {
      gsap.set(shell.current, { autoAlpha: 1 });
      gsap.fromTo(back.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: EASE.wipe });
      gsap.fromTo(frame.current, asTransform(r, t), { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: EASE.wipe, onComplete: () => setReady(true) });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [video, close]);

  return (
    <Ctx.Provider value={open}>
      {children}
      {video && (
        <div ref={shell} role="dialog" aria-modal aria-label={video.title} className="fixed inset-0 z-[250]" onClick={close}>
          <div ref={back} className="absolute inset-0 bg-espresso/90" />
          <div ref={frame} className="fixed overflow-hidden bg-espresso" onClick={(e) => e.stopPropagation()}>
            <YtImg id={video.id} className="absolute inset-0 h-full w-full object-cover" />
            {ready && (
              <iframe className="absolute inset-0 h-full w-full" src={ytEmbed(video.id)} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            )}
          </div>
          <button onClick={close} className="absolute right-5 top-5 rounded-full bg-cream px-5 py-2.5 text-[14px] font-medium text-espresso" aria-label="Close video">
            Close
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}
