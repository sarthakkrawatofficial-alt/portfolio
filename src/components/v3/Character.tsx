"use client";
import { useEffect, useRef } from "react";
import { gsap, EASE, reducedMotion, finePointer, ScrollTrigger } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/*
 * Illustrated Sarthak at his edit desk. Pose art: public/img/me/<pose>.webp (made in ChatGPT, see docs/character).
 * Hero: three cursor zones (desktop) or taps (touch) swap poses with a squash, hold 2.5 s, then back to work.
 */
export type Pose = "work" | "blink" | "lookL" | "lookR" | "caught" | "wave";
const POSES: Pose[] = ["work", "blink", "lookL", "lookR", "caught", "wave"];
const srcset = (p: Pose) => `${asset(`/img/me/${p}-sm.webp`)} 600w, ${asset(`/img/me/${p}.webp`)} 1100w`;
// the desk runs to the image edges; fade its two ends so it doesn't read as a cut slab
export const DESK_FADE: React.CSSProperties = {
  maskImage: "linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%), linear-gradient(#000, #000)",
  maskSize: "100% 9%, 100% 91.2%",
  maskPosition: "bottom, top",
  maskRepeat: "no-repeat",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%), linear-gradient(#000, #000)",
  WebkitMaskSize: "100% 9%, 100% 91.2%",
  WebkitMaskPosition: "bottom, top",
  WebkitMaskRepeat: "no-repeat",
};
const SAY: Partial<Record<Pose, string>> = { caught: "Got a video in mind?" };

export default function Character({ zoneRoot }: { zoneRoot: React.RefObject<HTMLElement | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const bubbleText = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = box.current!;
    const q = gsap.utils.selector(el);
    const reduce = reducedMotion();
    const rig = q(".c-rig");
    const imgs = Object.fromEntries(q(".c-pose").map((n) => [(n as HTMLElement).dataset.pose, n as HTMLImageElement])) as Record<Pose, HTMLImageElement>;

    let pose: Pose = "work";
    let moving = false; // inside the 0.09 s squash
    let pending: Pose | null = null;
    let waving = false;
    let pointerPose: Pose = "work"; // what the cursor position asks for (desktop)
    const fine = finePointer();

    const show = (p: Pose) => {
      for (const k of POSES) imgs[k].style.opacity = k === p ? "1" : "0";
    };
    const say = (txt?: string) => {
      if (!txt) { gsap.to(bubble.current, { autoAlpha: 0, y: 6, scale: 0.9, duration: 0.25, ease: EASE.wipe, overwrite: true }); return; }
      bubbleText.current!.textContent = txt;
      gsap.fromTo(bubble.current, { autoAlpha: 0, y: 8, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: EASE.pop, overwrite: true });
    };
    const apply = (p: Pose, line?: string) => {
      show(p); pose = p; el.dataset.pose = p;
      say(line ?? SAY[p]);
    };

    // one rule for every change: squash, swap, elastic settle. Requests that land mid-squash wait their turn.
    const go = (p: Pose, line?: string) => {
      if (moving) { pending = p; return; }
      if (p === pose && !line) return;
      if (reduce) { apply(p, line); return; }
      moving = true;
      gsap.timeline({ onComplete: () => { moving = false; if (pending && pending !== pose) { const n = pending; pending = null; go(n); } else pending = null; } })
        .to(rig, { scaleY: 0.965, scaleX: 1.025, duration: 0.09, ease: "power2.in" })
        .add(() => apply(p, line))
        .to(rig, { scaleY: 1, scaleX: 1, duration: 0.55, ease: "elastic.out(1, 0.45)" });
    };

    // click / tap: wave and say hi, then go back to whatever the cursor asks for
    let waveCall: gsap.core.Tween | null = null;
    const hello = (line = "Hey, I'm Sarthak") => {
      waving = true;
      waveCall?.kill();
      go("wave", line);
      waveCall = gsap.delayedCall(2.2, () => { waving = false; go(fine ? pointerPose : "work"); });
    };

    // idle: breathe, blink (only while working)
    gsap.set(rig, { transformOrigin: "50% 100%" });
    const breathe = reduce ? null : gsap.to(q(".c-breathe"), { scaleY: 1.008, transformOrigin: "50% 100%", duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    let blinkCall: gsap.core.Tween | null = null;
    const blink = () => {
      if (!reduce && !moving && pose === "work") {
        imgs.blink.style.opacity = "1";
        gsap.delayedCall(0.12, () => { if (pose === "work") imgs.blink.style.opacity = "0"; });
      }
      blinkCall = gsap.delayedCall(gsap.utils.random(3, 5.5), blink);
    };

    // first-time hint, gone after the first interaction
    let hinted = false;
    const hideHint = () => { if (hinted) return; hinted = true; gsap.to(hint.current, { autoAlpha: 0, y: 6, duration: 0.3, ease: EASE.wipe }); };

    // SC04: rises in, overshoots, settles, waves once
    gsap.set(el, { autoAlpha: 0, y: 40, scale: 0.9, transformOrigin: "50% 100%" });
    gsap.set(hint.current, { autoAlpha: 0, y: 8 });
    apply("work");
    let ready = false;
    const intro = () => {
      // pose art beyond "work" loads once the intro is done
      for (const k of POSES) if (imgs[k].dataset.src) { imgs[k].srcset = imgs[k].dataset.srcset!; imgs[k].src = imgs[k].dataset.src!; delete imgs[k].dataset.src; }
      gsap.to(el, {
        autoAlpha: 1, y: 0, scale: 1, duration: reduce ? 0.3 : 0.9, ease: reduce ? "none" : EASE.snap, delay: reduce ? 0 : 0.45,
        onComplete: () => {
          ready = true;
          hello();
          blinkCall = gsap.delayedCall(4, blink);
          if (!hinted) gsap.to(hint.current, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.settle, delay: 2.4 });
        },
      });
    };
    window.addEventListener("intro:done", intro, { once: true });

    // SC05 (desktop): cursor left of him -> looks left; right of him -> looks right; on him -> headphones off, "Got a video in mind?".
    // Leave the hero, or stop moving for 4 s -> back to work.
    let idle: gsap.core.Tween | null = null;
    const onMove = (e: PointerEvent) => {
      if (!ready) return;
      const hero = zoneRoot.current?.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (!hero) return;
      const inHero = e.clientY >= hero.top && e.clientY <= hero.bottom;
      const onHim = e.clientX >= r.left + r.width * 0.12 && e.clientX <= r.right - r.width * 0.12 && e.clientY >= r.top && e.clientY <= r.bottom;
      pointerPose = !inHero ? "work" : onHim ? "caught" : e.clientX < r.left + r.width * 0.12 ? "lookL" : "lookR";
      if (onHim) hideHint();
      idle?.kill();
      idle = gsap.delayedCall(4, () => { pointerPose = "work"; if (!waving) go("work"); });
      if (!waving) go(pointerPose);
    };
    const onClick = () => { if (!ready) return; hideHint(); hello(); };
    el.addEventListener("click", onClick);
    if (fine) window.addEventListener("pointermove", onMove);

    // scroll: heading down the page he gets back to work; coming back to the top he waves again
    const st = ScrollTrigger.create({
      trigger: zoneRoot.current, start: "top top", end: "60% top",
      onLeave: () => { pointerPose = "work"; waving = false; waveCall?.kill(); go("work"); },
      onEnterBack: () => { if (ready) hello("Welcome back"); },
    });

    return () => {
      window.removeEventListener("intro:done", intro);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("click", onClick);
      breathe?.kill(); blinkCall?.kill(); idle?.kill(); waveCall?.kill(); st.kill();
    };
  }, [zoneRoot]);

  return (
    <div ref={box} className="intro-hide relative mx-auto w-full max-w-[300px] cursor-pointer select-none md:max-w-[560px]" data-cursor="link" role="img" aria-label="Illustration of Sarthak at his editing desk, reacting to your cursor">
      <div ref={bubble} className="invisible absolute right-[0%] top-[6%] z-10 origin-bottom-left rounded-2xl rounded-bl-sm bg-espresso px-3.5 py-2 text-[14px] font-medium text-cream opacity-0 md:text-[15px]">
        <span ref={bubbleText} />
      </div>
      <p ref={hint} className="invisible absolute -bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[14px] text-cocoa">
        <span className="block h-2 w-2 rotate-45 bg-saffron" />
        <span className="hidden md:inline">Move your cursor around me, or click to say hi</span>
        <span className="md:hidden">Tap me to say hi</span>
      </p>
      <div className="c-rig relative aspect-square w-full">
        <div className="c-breathe absolute inset-0" style={DESK_FADE}>
          {POSES.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p}
              data-pose={p}
              sizes="(max-width: 767px) 300px, 560px"
              {...(p === "work" ? { src: asset(`/img/me/${p}.webp`), srcSet: srcset(p) } : { "data-src": asset(`/img/me/${p}.webp`), "data-srcset": srcset(p) })}
              alt=""
              draggable={false}
              decoding="async"
              className="c-pose absolute inset-0 h-full w-full object-contain"
              style={{ opacity: p === "work" ? 1 : 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
