"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";
import { ytEmbed, type Orientation } from "@/content/site";

type Open = (v: { id: string; title: string; orientation?: Orientation }) => void;
const Ctx = createContext<Open>(() => {});
export const useVideoModal = () => useContext(Ctx);

export function VideoModalProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideo] = useState<{ id: string; title: string; orientation?: Orientation } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const open = useCallback<Open>((v) => setVideo(v), []);
  const close = useCallback(() => {
    gsap.to(box.current, { opacity: 0, duration: 0.3, onComplete: () => setVideo(null) });
  }, []);

  useEffect(() => {
    if (!video) return;
    scrollState.lenis?.stop();
    gsap.fromTo(box.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(box.current!.querySelector(".vm-frame"), { scale: 0.92, y: 30 }, { scale: 1, y: 0, duration: 0.7, ease: "expo.out" });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); scrollState.lenis?.start(); };
  }, [video, close]);

  const portrait = video?.orientation === "portrait";
  return (
    <Ctx.Provider value={open}>
      {children}
      {video && (
        <div ref={box} role="dialog" aria-modal aria-label={video.title} className="fixed inset-0 z-[250] grid place-items-center bg-black/85 backdrop-blur-xl p-4" onClick={close}>
          <div
            className={`vm-frame relative overflow-hidden rounded-3xl border border-line bg-black glow-lime ${portrait ? "h-[82vh] aspect-[9/16] max-w-[92vw]" : "w-full max-w-6xl aspect-video"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe className="absolute inset-0 h-full w-full" src={ytEmbed(video.id)} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          </div>
          <button onClick={close} className="label absolute right-5 top-5 rounded-full border border-line bg-card px-4 py-2.5 text-fg hover:border-lime hover:text-lime" aria-label="Close video">
            Close ✕
          </button>
        </div>
      )}
    </Ctx.Provider>
  );
}
