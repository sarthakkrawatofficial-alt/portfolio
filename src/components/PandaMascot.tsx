"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/useIsoLayout";

/*
 * 2D street-style panda mascot, drawn as layered SVG so every part can move:
 * pops in and waves when the page opens, sits down as you scroll past the
 * hero (and stands back up on the way back), and tilts its head toward the
 * cursor. Original illustration — built from simple shapes.
 */

const INK = "#151515";
const INK2 = "#262626";
const CREAM = "#efe4d1";
const CREAM2 = "#d8c9b0";
const GOLD = "#c9a45c";

export default function PandaMascot({ className = "", trigger }: { className?: string; trigger?: React.RefObject<HTMLElement | null> }) {
  const root = useRef<SVGSVGElement>(null);

  useIsoLayoutEffect(() => {
    const svg = root.current!;
    const q = gsap.utils.selector(svg);
    const ctx = gsap.context(() => {
      gsap.set(q(".pm-arm-r"), { svgOrigin: "268 268" });
      gsap.set(q(".pm-fore-r"), { svgOrigin: "300 330" });
      gsap.set(q(".pm-head"), { svgOrigin: "200 250" });
      gsap.set(q(".pm-body"), { svgOrigin: "200 540" });
      gsap.set(q(".pm-sit-legs"), { autoAlpha: 0 });
      gsap.set(svg, { autoAlpha: 0, y: 40, scale: 0.9, transformOrigin: "50% 100%" });

      // idle: breathing + gentle head bob
      gsap.to(q(".pm-torso"), { scaleY: 1.012, svgOrigin: "200 400", duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(q(".pm-head-bob"), { y: 3, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      // sunglasses glint
      gsap.fromTo(q(".pm-glint"), { x: -60, opacity: 0 }, { x: 70, opacity: 0.9, duration: 0.9, ease: "power2.inOut", repeat: -1, repeatDelay: 3.5 });

      const wave = () =>
        gsap
          .timeline()
          .to(q(".pm-arm-r"), { rotation: -118, duration: 0.55, ease: "back.out(1.6)" })
          .to(q(".pm-fore-r"), { rotation: 35, duration: 0.2, ease: "sine.inOut", yoyo: true, repeat: 7 }, "<0.35")
          .to(q(".pm-head"), { rotation: -5, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, "<")
          .to(q(".pm-arm-r"), { rotation: 0, duration: 0.6, ease: "power3.inOut" }, "+=0.15");

      const intro = () =>
        gsap
          .timeline()
          .to(svg, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.4)" })
          .add(wave(), "-=0.2");
      window.addEventListener("intro:done", intro, { once: true });
      // wave again every so often while the hero is in view (skipped while sitting)
      let seated = false;
      const again = setInterval(() => { if (!seated && window.scrollY < 80) wave(); }, 9000);
      const fallback = setTimeout(intro, 2800);

      // sit down while scrolling past the hero
      const sit = gsap
        .timeline({ paused: true })
        .to(q(".pm-stand-legs"), { autoAlpha: 0, scaleY: 0.6, svgOrigin: "200 420", duration: 0.35, ease: "power2.in" }, 0)
        .to(q(".pm-body"), { y: 92, duration: 0.5, ease: "power3.out" }, 0.1)
        .to(q(".pm-sit-legs"), { autoAlpha: 1, duration: 0.3 }, 0.25)
        .fromTo(q(".pm-sit-legs"), { scale: 0.7, svgOrigin: "200 470" }, { scale: 1, duration: 0.45, ease: "back.out(1.7)" }, 0.25)
        .to(q(".pm-arm-l"), { rotation: 18, svgOrigin: "132 268", duration: 0.4 }, 0.15)
        .to(q(".pm-head"), { rotation: 6, duration: 0.4 }, 0.2);
      const st = ScrollTrigger.create({
        trigger: trigger?.current ?? svg,
        start: "top+=15% top",
        end: "bottom top",
        onEnter: () => { seated = true; sit.play(); },
        onLeaveBack: () => { seated = false; sit.reverse(); },
      });

      // head follows the cursor a little
      const tilt = gsap.quickTo(q(".pm-head-look"), "rotation", { duration: 0.6, ease: "power3" });
      const shift = gsap.quickTo(q(".pm-head-look"), "x", { duration: 0.6, ease: "power3" });
      gsap.set(q(".pm-head-look"), { svgOrigin: "200 250" });
      const onMove = (e: PointerEvent) => {
        const r = svg.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        tilt(gsap.utils.clamp(-8, 8, dx * 18));
        shift(gsap.utils.clamp(-6, 6, dx * 14));
      };
      window.addEventListener("pointermove", onMove);
      return () => {
        clearTimeout(fallback);
        clearInterval(again);
        window.removeEventListener("intro:done", intro);
        window.removeEventListener("pointermove", onMove);
        st.kill();
      };
    }, svg);
    return () => ctx.revert();
  }, [trigger]);

  return (
    <svg ref={root} viewBox="0 0 400 560" className={className} role="img" aria-label="Panda mascot waving" style={{ overflow: "visible", filter: "drop-shadow(0 0 1px rgba(255,255,255,0.35)) drop-shadow(0 24px 40px rgba(0,0,0,0.55))" }}>
      <defs>
        <filter id="pm-fur" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="pm-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <radialGradient id="pm-head-g" cx="42%" cy="38%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#f1eee8" />
          <stop offset="1" stopColor="#cfcac2" />
        </radialGradient>
        <radialGradient id="pm-black-g" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#333" />
          <stop offset="1" stopColor={INK} />
        </radialGradient>
        <linearGradient id="pm-cream-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6eddd" />
          <stop offset="1" stopColor={CREAM2} />
        </linearGradient>
        <linearGradient id="pm-jacket-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b2b2b" />
          <stop offset="1" stopColor={INK} />
        </linearGradient>
        <linearGradient id="pm-lens-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2e" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <clipPath id="pm-lens-clip">
          <path d="M108 134 Q110 126 120 125 L180 124 Q190 124 190 134 L187 168 Q184 186 166 187 L130 187 Q113 186 110 168 Z M210 134 Q210 124 220 124 L280 125 Q290 126 292 134 L290 168 Q287 186 270 187 L234 187 Q216 186 213 168 Z" />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx="200" cy="545" rx="130" ry="16" fill="#000" opacity="0.45" filter="url(#pm-soft)" />

      <g className="pm-body">
        {/* ---------- standing legs ---------- */}
        <g className="pm-stand-legs">
          {[0, 1].map((i) => {
            const x = i ? 228 : 172;
            const s = i ? 1 : -1;
            return (
              <g key={i}>
                <path d={`M${x - 30} 405 L${x + 30} 405 L${x + 27} 500 Q${x} 508 ${x - 27} 500 Z`} fill="url(#pm-jacket-g)" />
                {/* cargo pocket */}
                <rect x={i ? x + 12 : x - 40} y="432" width="28" height="34" rx="4" fill={INK2} />
                <rect x={i ? x + 10 : x - 42} y="428" width="32" height="10" rx="3" fill="#303030" />
                <rect x={i ? x + 22 : x - 30} y="436" width="8" height="12" rx="1.5" fill="none" stroke={GOLD} strokeWidth="2" />
                {/* jogger cuff */}
                <rect x={x - 27} y="492" width="54" height="14" rx="6" fill="#1d1d1d" />
                {/* sneaker */}
                <path d={`M${x - 34 + s * 4} 512 Q${x - 30 + s * 4} 498 ${x - 6} 500 L${x + 18} 500 Q${x + 38 + s * 4} 504 ${x + 38 + s * 4} 524 L${x + 38 + s * 4} 532 L${x - 36 + s * 4} 532 Z`} fill={CREAM} />
                <path d={`M${x - 20} 506 L${x + 22} 506 L${x + 26} 520 L${x - 22} 520 Z`} fill={INK} />
                <rect x={x - 38 + s * 4} y="528" width="78" height="10" rx="5" fill="#f7f1e6" stroke={CREAM2} />
              </g>
            );
          })}
        </g>

        {/* ---------- sitting legs (shown when sat down) ---------- */}
        <g className="pm-sit-legs">
          {[0, 1].map((i) => {
            const s = i ? 1 : -1;
            const fx = 200 + s * 92;
            return (
              <g key={i}>
                <path d={`M${200 + s * 20} 432 Q${200 + s * 70} 440 ${fx} 470 L${fx + s * 4} 498 Q${200 + s * 40} 500 ${200 + s * 10} 470 Z`} fill="url(#pm-jacket-g)" />
                <ellipse cx={fx} cy="488" rx="34" ry="44" fill={CREAM} stroke={CREAM2} strokeWidth="3" />
                <ellipse cx={fx} cy="478" rx="14" ry="11" fill={INK} />
                <ellipse cx={fx - 12} cy="505" rx="7" ry="6" fill={INK} />
                <ellipse cx={fx + 12} cy="505" rx="7" ry="6" fill={INK} />
                <ellipse cx={fx} cy="514" rx="6" ry="5" fill={INK} />
              </g>
            );
          })}
        </g>

        {/* ---------- backpack (behind body) ---------- */}
        <rect x="104" y="268" width="192" height="150" rx="40" fill="#121212" />
        {/* mini panda charm */}
        <g>
          <line x1="292" y1="370" x2="300" y2="402" stroke={GOLD} strokeWidth="3" />
          <circle cx="300" cy="418" r="17" fill="#f5f2ec" />
          <circle cx="288" cy="404" r="6" fill={INK} />
          <circle cx="312" cy="404" r="6" fill={INK} />
          <ellipse cx="293" cy="418" rx="4" ry="5" fill={INK} transform="rotate(-20 293 418)" />
          <ellipse cx="307" cy="418" rx="4" ry="5" fill={INK} transform="rotate(20 307 418)" />
          <circle cx="300" cy="425" r="2" fill={INK} />
        </g>

        {/* ---------- torso ---------- */}
        <g className="pm-torso">
          {/* hood behind neck */}
          <path d="M120 262 Q200 214 280 262 Q262 290 200 288 Q138 290 120 262 Z" fill="url(#pm-cream-g)" />
          {/* hoodie front */}
          <path d="M150 260 L250 260 Q262 330 258 404 L142 404 Q138 330 150 260 Z" fill="url(#pm-cream-g)" />
          <path d="M152 380 Q200 392 248 380 L250 404 L150 404 Z" fill={CREAM2} opacity="0.6" />
          <path d="M166 352 Q200 344 234 352 L238 382 Q200 390 162 382 Z" fill="none" stroke={CREAM2} strokeWidth="2.5" />
          {/* drawstrings */}
          <path d="M186 270 Q182 300 184 336" stroke="#f8f0e2" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M214 270 Q218 300 216 336" stroke="#f8f0e2" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="180" y="334" width="8" height="12" rx="2" fill="#bdb7ad" />
          <rect x="212" y="334" width="8" height="12" rx="2" fill="#bdb7ad" />
          {/* open bomber jacket */}
          <path d="M120 266 Q146 252 160 262 L164 404 L128 404 Q112 340 120 266 Z" fill="url(#pm-jacket-g)" stroke="#3b3b3b" strokeWidth="1.5" />
          <path d="M280 266 Q254 252 240 262 L236 404 L272 404 Q288 340 280 266 Z" fill="url(#pm-jacket-g)" stroke="#3b3b3b" strokeWidth="1.5" />
          <rect x="124" y="394" width="42" height="16" rx="6" fill="#1f1f1f" />
          <rect x="234" y="394" width="42" height="16" rx="6" fill="#1f1f1f" />
          {/* zipper teeth */}
          <path d="M160 268 L163 396" stroke={GOLD} strokeWidth="2" strokeDasharray="2 4" />
          <path d="M240 268 L237 396" stroke={GOLD} strokeWidth="2" strokeDasharray="2 4" />
          <rect x="238" y="320" width="6" height="14" rx="2" fill={GOLD} />
          {/* chest snap */}
          <rect x="138" y="290" width="12" height="7" rx="2" fill="#5a5a5a" />
          {/* sleeve patch (panda) on right side */}
          <rect x="255" y="290" width="20" height="18" rx="3" fill="#f0ece4" />
          <circle cx="265" cy="300" r="5" fill="#f0ece4" stroke={INK} strokeWidth="1.5" />
          {/* backpack straps */}
          <path d="M132 268 Q120 320 132 372" stroke="#0e0e0e" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M268 268 Q280 320 268 372" stroke="#0e0e0e" strokeWidth="12" fill="none" strokeLinecap="round" />
        </g>

        {/* ---------- left arm (hand in pocket) ---------- */}
        <g className="pm-arm-l">
          <path d="M132 268 Q104 310 120 362 Q130 384 152 382" stroke="url(#pm-jacket-g)" strokeWidth="46" fill="none" strokeLinecap="round" />
          <path d="M138 370 Q148 390 166 384" stroke="#1e1e1e" strokeWidth="14" fill="none" strokeLinecap="round" />
        </g>

        {/* ---------- right arm (waves) ---------- */}
        <g className="pm-arm-r">
          <path d="M268 268 Q292 296 300 330" stroke="url(#pm-jacket-g)" strokeWidth="46" fill="none" strokeLinecap="round" />
          <g className="pm-fore-r">
            <path d="M300 330 Q304 362 282 382" stroke="url(#pm-jacket-g)" strokeWidth="42" fill="none" strokeLinecap="round" />
            <path d="M292 372 Q286 384 274 388" stroke="#1e1e1e" strokeWidth="14" fill="none" strokeLinecap="round" />
            {/* paw */}
            <g filter="url(#pm-fur)">
              <circle cx="276" cy="398" r="22" fill="url(#pm-black-g)" />
            </g>
            <ellipse cx="276" cy="402" rx="9" ry="7" fill="#8e8a84" />
            <circle cx="264" cy="388" r="4.5" fill="#8e8a84" />
            <circle cx="276" cy="384" r="4.5" fill="#8e8a84" />
            <circle cx="288" cy="388" r="4.5" fill="#8e8a84" />
          </g>
        </g>

        {/* ---------- head ---------- */}
        <g className="pm-head">
          <g className="pm-head-look">
            <g className="pm-head-bob">
              {/* ears */}
              <g filter="url(#pm-fur)">
                <circle cx="104" cy="70" r="40" fill="url(#pm-black-g)" />
                <circle cx="296" cy="70" r="40" fill="url(#pm-black-g)" />
              </g>
              {/* head */}
              <g filter="url(#pm-fur)">
                <ellipse cx="200" cy="160" rx="124" ry="108" fill="url(#pm-head-g)" />
              </g>
              {/* eye patches peeking from under the glasses */}
              <ellipse cx="148" cy="172" rx="36" ry="26" fill={INK} transform="rotate(-22 148 172)" opacity="0.9" />
              <ellipse cx="252" cy="172" rx="36" ry="26" fill={INK} transform="rotate(22 252 172)" opacity="0.9" />
              {/* muzzle */}
              <ellipse cx="200" cy="214" rx="44" ry="30" fill="#fbfaf7" />
              <path d="M188 200 Q200 194 212 200 Q210 212 200 214 Q190 212 188 200 Z" fill={INK} />
              <ellipse cx="196" cy="200" rx="4" ry="2" fill="#fff" opacity="0.6" />
              <path d="M184 222 Q192 232 200 224 Q208 232 216 222" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* sunglasses */}
              <path d="M84 150 L108 138" stroke={INK} strokeWidth="7" strokeLinecap="round" />
              <path d="M316 150 L292 138" stroke={INK} strokeWidth="7" strokeLinecap="round" />
              <path
                d="M108 134 Q110 126 120 125 L180 124 Q190 124 190 134 L187 168 Q184 186 166 187 L130 187 Q113 186 110 168 Z M210 134 Q210 124 220 124 L280 125 Q290 126 292 134 L290 168 Q287 186 270 187 L234 187 Q216 186 213 168 Z"
                fill="url(#pm-lens-g)"
                stroke="#000"
                strokeWidth="5"
              />
              <path d="M190 136 Q200 130 210 136" stroke="#000" strokeWidth="7" fill="none" />
              <g clipPath="url(#pm-lens-clip)">
                <rect className="pm-glint" x="120" y="110" width="22" height="100" fill="#fff" opacity="0" transform="rotate(25 130 160)" />
                <path d="M118 140 L150 130" stroke="#fff" strokeWidth="5" opacity="0.18" strokeLinecap="round" />
                <path d="M220 140 L252 130" stroke="#fff" strokeWidth="5" opacity="0.18" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
