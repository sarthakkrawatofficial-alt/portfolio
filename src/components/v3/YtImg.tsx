"use client";
import { useState } from "react";
import { ytThumb } from "@/content/site";

/** YouTube still without letterbox bars: maxres (1280x720) first, then mq (320x180). hq/sd are 4:3 with black bars. */
export default function YtImg({ id, alt = "", className = "", style }: { id: string; alt?: string; className?: string; style?: React.CSSProperties }) {
  const [small, setSmall] = useState(false);
  const src = small ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ytThumb(id, "maxres");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setSmall(true)}
      // a missing maxres comes back as YouTube's 120x90 grey placeholder, not an error
      onLoad={(e) => { if ((e.currentTarget as HTMLImageElement).naturalWidth <= 120) setSmall(true); }}
      className={className}
      style={style}
    />
  );
}
