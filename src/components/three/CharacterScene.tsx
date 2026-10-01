"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

/*
 * Hero 3D: an original vinyl-toy mascot built from primitives — a cat in a
 * play-logo tee, wearing headphones and sunglasses, nodding to music. Colours
 * come from the site's CSS tokens so it follows the active theme.
 */

type Palette = { fur: string; shirt: string; logo: string; shorts: string; phones: string; sole: string; bg: string };

function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  return {
    fur: v("--char-fur", v("--color-fg", "#1f1c18")),
    shirt: v("--char-shirt", v("--color-lime", "#5b6630")),
    logo: v("--char-logo", v("--color-bg", "#efe8dc")),
    shorts: v("--char-shorts", v("--color-card2", "#e9e1d3")),
    phones: v("--char-phones", v("--color-paper", "#fbf8f2")),
    sole: v("--char-sole", v("--color-lime", "#5b6630")),
    bg: v("--color-bg", "#efe8dc"),
  };
}

function usePalette() {
  const [p, setP] = useState<Palette | null>(null);
  useEffect(() => {
    setP(readPalette());
    const mo = new MutationObserver(() => setP(readPalette()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style", "class"] });
    return () => mo.disconnect();
  }, []);
  return p;
}

/** Fine noise used as a bump map so the "fur" reads as soft flocked vinyl. */
function useFeltTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = 110 + Math.random() * 145;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4);
    return t;
  }, []);
}

function Character({ p }: { p: Palette }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const felt = useFeltTexture();

  const fur = <meshStandardMaterial color={p.fur} roughness={0.95} bumpMap={felt} bumpScale={0.6} />;
  const furInner = <meshStandardMaterial color={p.logo} roughness={0.9} />;
  const earInner = <meshStandardMaterial color={p.sole} roughness={0.9} />;
  const shirt = <meshStandardMaterial color={p.shirt} roughness={0.85} bumpMap={felt} bumpScale={0.25} />;
  const shorts = <meshStandardMaterial color={p.shorts} roughness={0.9} bumpMap={felt} bumpScale={0.3} />;
  const plastic = <meshPhysicalMaterial color={p.phones} roughness={0.25} clearcoat={1} clearcoatRoughness={0.2} />;
  const lens = <meshPhysicalMaterial color="#0d0d0f" roughness={0.05} metalness={0.2} clearcoat={1} clearcoatRoughness={0.05} />;

  const playGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.07, -0.085);
    s.lineTo(0.1, 0);
    s.lineTo(-0.07, 0.085);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.015, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
    g.center();
    return g;
  }, []);

  const tailCurve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.12, 0.1, -0.18), new THREE.Vector3(0.32, 0.35, -0.22), new THREE.Vector3(0.38, 0.62, -0.1)]),
    [],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const vh = window.innerHeight || 800;
    const prog = Math.min(scrollState.y / vh, 1.5);
    const { x: px, y: py } = state.pointer;
    // nod to the beat (≈ 96 bpm)
    const beat = Math.sin(t * 5.0);
    if (head.current) {
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -py * 0.25 + beat * 0.06, 6, dt);
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, px * 0.55, 5, dt);
      head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, Math.sin(t * 2.5) * 0.05, 4, dt);
      head.current.position.y = 1.98 + Math.max(0, beat) * 0.025;
    }
    if (body.current) {
      body.current.rotation.z = Math.sin(t * 2.5) * 0.025;
      body.current.position.y = Math.abs(Math.sin(t * 2.5)) * 0.02;
    }
    if (tail.current) tail.current.rotation.y = Math.sin(t * 1.8) * 0.35;
    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.35 + px * 0.25 + prog * 1.2, 3, dt);
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, -1.25 + prog * 0.9, 4, dt);
    }
  });

  const ear = (side: 1 | -1) => (
    <group position={[side * 0.33, 0.56, 0.04]} rotation={[0.1, 0, side * -0.38]}>
      <mesh>
        <coneGeometry args={[0.23, 0.46, 24]} />
        {fur}
      </mesh>
      <mesh position={[0, -0.03, 0.09]} scale={[0.6, 0.72, 0.3]}>
        <coneGeometry args={[0.23, 0.46, 24]} />
        {earInner}
      </mesh>
    </group>
  );

  return (
    <group ref={root} position={[0, -1.25, 0]} rotation={[0, -0.35, 0]}>
      {/* soft floor shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.75, 48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} depthWrite={false} />
      </mesh>

      <group ref={body}>
        {/* sneakers */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.2, 0.09, 0.06]}>
            <RoundedBox args={[0.26, 0.16, 0.42]} radius={0.07} smoothness={4}>
              {plastic}
            </RoundedBox>
            <RoundedBox args={[0.27, 0.05, 0.43]} radius={0.02} smoothness={2} position={[0, -0.07, 0]}>
              <meshStandardMaterial color={p.sole} roughness={0.6} />
            </RoundedBox>
          </group>
        ))}
        {/* legs */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.2, 0.3, 0]}>
            <capsuleGeometry args={[0.1, 0.18, 8, 16]} />
            {fur}
          </mesh>
        ))}
        {/* shorts */}
        <mesh position={[0, 0.66, 0]}>
          <cylinderGeometry args={[0.43, 0.44, 0.18, 32]} />
          {shorts}
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.2, 0.5, 0]} rotation={[0, 0, s * 0.08]}>
            <cylinderGeometry args={[0.2, 0.18, 0.24, 24]} />
            {shorts}
          </mesh>
        ))}
        {/* shirt */}
        <mesh position={[0, 0.98, 0]}>
          <capsuleGeometry args={[0.43, 0.42, 12, 32]} />
          {shirt}
        </mesh>
        <mesh geometry={playGeo} position={[0, 1.08, 0.435]}>
          <meshStandardMaterial color={p.logo} roughness={0.6} />
        </mesh>
        {/* sleeves + arms tucked into pockets */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.45, 1.14, 0]} rotation={[0, 0, s * 0.16]}>
            <mesh>
              <sphereGeometry args={[0.17, 24, 16]} />
              {shirt}
            </mesh>
            <mesh position={[0, -0.32, 0.02]}>
              <capsuleGeometry args={[0.09, 0.34, 8, 16]} />
              {fur}
            </mesh>
          </group>
        ))}
        {/* tail */}
        <mesh ref={tail} position={[0, 0.55, -0.4]}>
          <tubeGeometry args={[tailCurve, 24, 0.055, 10, false]} />
          {fur}
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 1.98, 0]}>
        <mesh scale={[1.08, 0.95, 1]}>
          <sphereGeometry args={[0.58, 48, 32]} />
          {fur}
        </mesh>
        {/* muzzle + nose */}
        <mesh position={[0, -0.2, 0.47]} scale={[1.2, 0.8, 0.8]}>
          <sphereGeometry args={[0.13, 24, 16]} />
          {furInner}
        </mesh>
        <mesh position={[0, -0.13, 0.57]}>
          <sphereGeometry args={[0.04, 16, 12]} />
          <meshStandardMaterial color="#1a1614" roughness={0.4} />
        </mesh>
        {ear(1)}
        {ear(-1)}
        {/* headphones */}
        <mesh position={[0, 0.04, -0.16]} rotation={[-0.3, 0, 0]}>
          <torusGeometry args={[0.63, 0.045, 16, 48, Math.PI]} />
          {plastic}
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.62, -0.02, -0.06]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 0.14, 32]} />
              {plastic}
            </mesh>
            <mesh position={[0, s * -0.08, 0]}>
              <cylinderGeometry args={[0.17, 0.17, 0.05, 32]} />
              <meshStandardMaterial color={p.sole} roughness={0.8} />
            </mesh>
          </group>
        ))}
        {/* sunglasses */}
        <group position={[0, 0.05, 0.53]}>
          {[-1, 1].map((s) => (
            <RoundedBox key={s} args={[0.32, 0.2, 0.05]} radius={0.05} smoothness={4} position={[s * 0.19, 0, 0]} rotation={[0, s * 0.18, 0]}>
              {lens}
            </RoundedBox>
          ))}
          <mesh position={[0, 0.04, 0.01]}>
            <boxGeometry args={[0.1, 0.03, 0.03]} />
            {lens}
          </mesh>
        </group>
      </group>
    </group>
  );
}

/** Sizes and places the character relative to the visible viewport. */
function Rig({ mobile, children }: { mobile: boolean; children: React.ReactNode }) {
  const { viewport } = useThree();
  const h = viewport.height, w = viewport.width;
  // character is ~2.9 units tall at scale 1
  const scale = mobile ? Math.min((h * 0.28) / 2.9, (w * 0.55) / 1.8) : Math.min((h * 0.64) / 2.9, (w * 0.3) / 1.8);
  const x = mobile ? 0 : w * 0.24;
  const y = mobile ? h * 0.3 : h * 0.06;
  return <group position={[x, y, 0]} scale={scale}>{children}</group>;
}

export default function CharacterScene({ mobile = false, eventSource }: { mobile?: boolean; eventSource?: React.RefObject<HTMLElement | null> }) {
  const palette = usePalette();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = eventSource?.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [eventSource]);

  if (!palette) return null;
  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      dpr={mobile ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0.4, 6.4], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={1.4} color="#fff2dc" />
      <Rig mobile={mobile}>
        <Character p={palette} />
      </Rig>
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 5, -4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
