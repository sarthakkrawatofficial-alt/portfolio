"use client";
import { useRef } from "react";
import { gsap, EASE } from "@/lib/gsap";
import Magnetic from "../motion/Magnetic";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  icon?: React.ReactNode;
  className?: string;
};

/** SC22: a fill grows from where the cursor came in, the label rolls up. Leaves toward the exit point. */
export default function Btn({ children, href, onClick, variant = "primary", icon, className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  const at = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const size = Math.hypot(r.width, r.height) * 2.1;
    gsap.set(fill.current, { width: size, height: size, left: e.clientX - r.left - size / 2, top: e.clientY - r.top - size / 2 });
  };
  const enter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    at(e);
    const q = gsap.utils.selector(ref.current);
    gsap.fromTo(fill.current, { scale: 0 }, { scale: 1, duration: 0.5, ease: EASE.settle, overwrite: true });
    gsap.to(q(".btn-roll"), { yPercent: -100, duration: 0.45, ease: EASE.snap, overwrite: true });
    ref.current!.dataset.hot = "1";
  };
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    at(e);
    const q = gsap.utils.selector(ref.current);
    gsap.to(fill.current, { scale: 0, duration: 0.4, ease: EASE.wipe, overwrite: true });
    gsap.to(q(".btn-roll"), { yPercent: 0, duration: 0.45, ease: EASE.snap, overwrite: true });
    ref.current!.dataset.hot = "";
  };

  const base =
    "group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full px-7 text-[16px] font-medium transition-colors duration-300 data-[hot=1]:text-cream";
  const look =
    variant === "primary"
      ? "bg-saffron text-espresso"
      : "border border-espresso/25 bg-transparent text-espresso";
  const inner = (
    <>
      <span ref={fill} aria-hidden className="pointer-events-none absolute rounded-full bg-espresso" style={{ transform: "scale(0)" }} />
      {icon && <span className="relative grid h-8 w-8 -ml-3 place-items-center rounded-full bg-espresso text-saffron">{icon}</span>}
      <span className="relative block h-[1.25em] overflow-hidden leading-[1.25em]">
        <span className="btn-roll block">{children}</span>
        <span className="btn-roll block" aria-hidden>{children}</span>
      </span>
    </>
  );
  const common = {
    className: `${base} ${look} ${className}`,
    onPointerEnter: enter,
    onPointerLeave: leave,
    "data-cursor": "link",
  };
  return (
    <Magnetic strength={0.25}>
      {href ? (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...common}>{inner}</a>
      ) : (
        <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={onClick} {...common}>{inner}</button>
      )}
    </Magnetic>
  );
}
