"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";
import { asset } from "@/lib/asset";

/*
 * 2D panda mascot built from pose cut-outs (public/img/panda/*.webp).
 * Pops in and waves on load, cycles through a few idle poses, waves when
 * clicked, and sits down when you scroll past the hero.
 */

type Pose = "stand" | "wave" | "point" | "cross" | "sit";
// natural size on the source sheet + where the head's centre sits horizontally
const POSES: Record<Pose, { w: number; h: number; cx: number }> = {
  stand: { w: 335, h: 566, cx: 0.43 },
  wave: { w: 377, h: 571, cx: 0.615 },
  point: { w: 364, h: 578, cx: 0.412 },
  cross: { w: 290, h: 566, cx: 0.528 },
  sit: { w: 418, h: 437, cx: 0.477 },
};
const REF_H = 580; // container height in sheet pixels
const IDLE: Pose[] = ["stand", "point", "stand", "cross", "stand", "wave"];

export default function PandaSprite({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const body = q(".ps-body")[0];
      let current: Pose = "wave";
      let seated = false;
      let busy = false;

      const show = (p: Pose) => {
        if (seated && p !== "sit") return; // never stand up mid-scroll
        q(".ps-pose").forEach((img) => ((img as HTMLElement).style.opacity = (img as HTMLElement).dataset.pose === p ? "1" : "0"));
        current = p;
      };
      // squash → swap → stretch, like a cartoon pose change
      const swap = (p: Pose) =>
        gsap
          .timeline()
          .to(body, { scaleY: 0.93, scaleX: 1.05, duration: 0.09, ease: "power2.in" })
          .add(() => show(p))
          .to(body, { scaleY: 1, scaleX: 1, duration: 0.55, ease: "elastic.out(1, 0.45)" });

      const sayHi = () =>
        gsap.fromTo(bubble.current, { autoAlpha: 0, y: 10, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(2)", yoyo: true, repeat: 1, repeatDelay: 1.6 });

      const wave = () => {
        if (busy || seated) return;
        busy = true;
        gsap
          .timeline({ onComplete: () => { busy = false; } })
          .add(swap("wave"))
          .add(sayHi(), 0.1)
          .to(body, { rotation: 4, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: 5 }, 0.2)
          .to(body, { rotation: 0, duration: 0.2 })
          .add(swap("stand"), "+=0.5");
      };

      gsap.set(body, { transformOrigin: "50% 100%" });
      gsap.set(el, { autoAlpha: 0, y: 50, scale: 0.85, transformOrigin: "50% 100%" });
      show("wave");

      // idle breathing
      gsap.to(q(".ps-breathe"), { scaleY: 1.012, transformOrigin: "50% 100%", duration: 1.7, ease: "sine.inOut", yoyo: true, repeat: -1 });

      const intro = () =>
        gsap.timeline().to(el, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.5)" }).add(() => {
          busy = false;
          current = "stand";
          show("wave");
          wave();
        }, "-=0.3");
      window.addEventListener("intro:done", intro, { once: true });
      const fallback = setTimeout(intro, 2800);

      // idle pose cycle
      let i = 0;
      const cycle = setInterval(() => {
        if (busy || seated || document.hidden) return;
        const next = IDLE[++i % IDLE.length];
        if (next === "wave") wave();
        else if (next !== current) swap(next);
      }, 3200);

      // sit once the page is scrolled a little, stand + wave when back at the top
      const sitDown = () => {
        seated = true;
        gsap.timeline().to(body, { y: -24, duration: 0.18, ease: "power2.out" }).add(() => show("sit")).to(body, { y: 0, duration: 0.5, ease: "bounce.out" });
      };
      const standUp = () => {
        seated = false;
        busy = false;
        swap("stand");
        gsap.delayedCall(0.6, wave);
      };
      const onScroll = () => {
        const down = window.scrollY > 80;
        if (down && !seated) sitDown();
        else if (!down && seated) standUp();
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      // click / tap → wave
      el.addEventListener("click", wave);

      // lean a little toward the cursor
      const lean = gsap.quickTo(q(".ps-lean"), "rotation", { duration: 0.8, ease: "power3" });
      gsap.set(q(".ps-lean"), { transformOrigin: "50% 100%" });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        lean(gsap.utils.clamp(-3, 3, ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 8));
      };
      window.addEventListener("pointermove", onMove);

      return () => {
        clearTimeout(fallback);
        clearInterval(cycle);
        window.removeEventListener("scroll", onScroll);
        el.removeEventListener("click", wave);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("intro:done", intro);
      };
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className={`select-none ${className}`} style={{ aspectRatio: `430 / ${REF_H}` }} data-cursor="link" role="img" aria-label="Panda mascot waving hello">
      {/* speech bubble */}
      <div ref={bubble} className="label invisible absolute left-[58%] top-[2%] z-10 whitespace-nowrap rounded-2xl rounded-bl-sm bg-lime px-3 py-2 text-[11px] font-bold text-bg opacity-0 shadow-lg md:text-xs">
        Hey there 👋
      </div>
      {/* contact shadow */}
      <div className="absolute bottom-[-2%] left-1/2 h-[5%] w-[62%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-md" />
      <div className="ps-lean absolute inset-0">
        <div className="ps-breathe absolute inset-0">
          <div className="ps-body absolute inset-0">
            {(Object.keys(POSES) as Pose[]).map((p) => {
              const { w, h, cx } = POSES[p];
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p}
                  data-pose={p}
                  src={asset(`/img/panda/${p}.webp`)}
                  alt=""
                  draggable={false}
                  className="ps-pose absolute bottom-0 max-w-none transition-none"
                  style={{ height: `${(h / REF_H) * 100}%`, width: "auto", aspectRatio: `${w} / ${h}`, left: "50%", transform: `translateX(-${cx * 100}%)`, opacity: p === "wave" ? 1 : 0 }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
