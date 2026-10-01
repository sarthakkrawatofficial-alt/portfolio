"use client";
import { useRef, useState } from "react";
import { ytEmbed, ytThumb } from "@/content/site";

/** Thumbnail that swaps to a muted, looping YouTube preview on hover. */
export default function VideoThumb({ id, title, className = "", preview = true, quality = "hq" }: { id: string; title: string; className?: string; preview?: boolean; quality?: "hq" | "maxres" }) {
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => {
    if (!preview || !window.matchMedia("(hover: hover)").matches) return;
    t.current = setTimeout(() => setLive(true), 220);
  };
  const leave = () => { if (t.current) clearTimeout(t.current); setLive(false); setReady(false); };
  return (
    <div className={`absolute inset-0 overflow-hidden bg-card2 ${className}`} onPointerEnter={enter} onPointerLeave={leave}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ytThumb(id, quality)}
        onError={(e) => { if (quality === "maxres") (e.currentTarget as HTMLImageElement).src = ytThumb(id); }}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover saturate-[0.6] transition-[transform,filter] duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06] group-hover:saturate-100"
      />
      {live && (
        <iframe
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          src={ytEmbed(id, { muted: true, controls: false, loop: true })}
          title={`${title} preview`}
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          onLoad={() => setTimeout(() => setReady(true), 400)}
        />
      )}
    </div>
  );
}
