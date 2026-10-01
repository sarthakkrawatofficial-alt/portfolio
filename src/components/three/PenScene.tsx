"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

/*
 * Hero 3D: a design-tool vignette. A glossy pen-tool nib draws a bezier path
 * live (anchor points + handles), while a 3D selection cursor
 * trails the visitor's mouse. Colours come from the theme tokens.
 */

type Palette = { accent: string; fg: string; muted: string; bg: string };
function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  return { accent: v("--color-lime", "#e6d8bd"), fg: v("--color-fg", "#eeeae3"), muted: v("--color-muted", "#8f8a82"), bg: v("--color-bg", "#121212") };
}
function usePalette() {
  const [p, setP] = useState<Palette | null>(null);
  useEffect(() => {
    setP(readPalette());
    const mo = new MutationObserver(() => setP(readPalette()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return p;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The classic pen-tool nib, extruded with a bevel. Tip sits at the local origin. */
function useNibGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -1);
    s.lineTo(0.5, 0.02);
    s.quadraticCurveTo(0.6, 0.26, 0.4, 0.46);
    s.lineTo(0.4, 0.62);
    s.lineTo(-0.4, 0.62);
    s.lineTo(-0.4, 0.46);
    s.quadraticCurveTo(-0.6, 0.26, -0.5, 0.02);
    s.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0.06, 0.1, 0, Math.PI * 2, true);
    s.holes.push(hole);
    const slit = new THREE.Path();
    slit.moveTo(-0.02, -0.04);
    slit.lineTo(-0.02, -0.82);
    slit.lineTo(0.02, -0.82);
    slit.lineTo(0.02, -0.04);
    slit.closePath();
    s.holes.push(slit);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.04, bevelSegments: 5, curveSegments: 24 });
    g.translate(0, 1, -0.08); // tip at origin
    return g;
  }, []);
}

/** A classic selection-arrow cursor, extruded. Tip at the local origin. */
function useCursorGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0, -1.0);
    s.lineTo(0.26, -0.76);
    s.lineTo(0.44, -1.16);
    s.lineTo(0.6, -1.09);
    s.lineTo(0.42, -0.7);
    s.lineTo(0.76, -0.7);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4 });
    g.translate(0, 0, -0.05);
    return g;
  }, []);
}

function Vignette({ p, mobile }: { p: Palette; mobile: boolean }) {
  const root = useRef<THREE.Group>(null);
  const pen = useRef<THREE.Group>(null);
  const tube = useRef<THREE.Mesh>(null);
  const handle = useRef<THREE.Group>(null);
  const handleA = useRef<THREE.Mesh>(null);
  const handleB = useRef<THREE.Mesh>(null);
  const handleLine = useRef<THREE.Mesh>(null);
  const cursor = useRef<THREE.Group>(null);
  const nib = useNibGeometry();
  const arrow = useCursorGeometry();

  // the path the pen draws — a lively S-curve, like an easing graph
  const curve = useMemo(
    () =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(-1.7, -0.9, 0),
        new THREE.Vector3(-0.2, -1.4, 0.3),
        new THREE.Vector3(0.1, 1.3, -0.3),
        new THREE.Vector3(1.7, 0.85, 0),
      ),
    [],
  );
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.028, 10, false), [curve]);
  const total = tubeGeo.index ? tubeGeo.index.count : 0;
  const anchors = useMemo(() => [0, 0.5, 1].map((t) => curve.getPointAt(t)), [curve]);
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), tan: new THREE.Vector3(), target: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const vh = window.innerHeight || 800;
    const prog = Math.min(scrollState.y / vh, 1.5);
    const { x: px, y: py } = state.pointer;

    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.28 + px * 0.25 + prog * 0.6, 3, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, 0.12 - py * 0.15 + prog * 0.25, 3, dt);
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, prog * 0.8, 4, dt);
    }

    // drawing loop: 3.2s draw, 1.2s hold, 0.6s erase
    const cycle = 5;
    const c = t % cycle;
    const k = c < 3.2 ? easeInOut(c / 3.2) : c < 4.4 ? 1 : 1 - (c - 4.4) / 0.6;
    const drawn = Math.max(0.0001, k);
    if (tube.current) tube.current.geometry.setDrawRange(0, Math.floor(total * drawn / 6) * 6);

    curve.getPointAt(Math.min(drawn, 0.999), tmp.pos);
    curve.getTangentAt(Math.min(drawn, 0.999), tmp.tan);
    if (pen.current) {
      pen.current.position.lerp(tmp.pos, 0.35);
      // tilt the nib like a hand holding it, with a little wobble
      pen.current.rotation.z = THREE.MathUtils.damp(pen.current.rotation.z, -0.55 + Math.sin(t * 3) * 0.05, 6, dt);
      pen.current.rotation.y = Math.sin(t * 0.8) * 0.25;
    }
    // bezier handle that follows the pen, like dragging out a smooth point
    if (handle.current && handleA.current && handleB.current && handleLine.current) {
      handle.current.position.copy(tmp.pos);
      const len = 0.45 + Math.sin(t * 2) * 0.08;
      const ang = Math.atan2(tmp.tan.y, tmp.tan.x);
      handle.current.rotation.z = ang;
      handleA.current.position.x = len;
      handleB.current.position.x = -len;
      handleLine.current.scale.x = len * 2;
      handle.current.visible = c < 4.4;
    }

    // 3D cursor trails the real mouse inside the composition
    if (cursor.current) {
      tmp.target.set(0.55 + px * 1.1, 0.05 + py * 0.8 + Math.sin(t * 1.6) * 0.06, 0.6);
      cursor.current.position.lerp(tmp.target, 1 - Math.pow(0.002, dt));
      cursor.current.rotation.y = Math.sin(t * 1.2) * 0.25 - 0.2;
      cursor.current.rotation.z = 0.12 + Math.sin(t * 1.6) * 0.04;
    }
  });

  const accentMat = <meshPhysicalMaterial color={p.accent} metalness={0.55} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />;
  const fgMat = <meshStandardMaterial color={p.fg} roughness={0.35} />;

  return (
    <group ref={root} rotation={[0.12, -0.28, 0]}>
      {/* path */}
      <mesh ref={tube} geometry={tubeGeo}>
        <meshStandardMaterial color={p.accent} roughness={0.4} emissive={p.accent} emissiveIntensity={0.15} />
      </mesh>
      {/* anchor points (square, like vector anchors) */}
      {anchors.map((a, i) => (
        <group key={i} position={a}>
          <mesh>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color={p.bg} roughness={0.5} />
            <Edges color={p.fg} />
          </mesh>
        </group>
      ))}
      {/* live bezier handle */}
      <group ref={handle}>
        <mesh ref={handleLine}>
          <boxGeometry args={[1, 0.012, 0.012]} />
          <meshBasicMaterial color={p.muted} />
        </mesh>
        <mesh ref={handleA}>
          <sphereGeometry args={[0.055, 20, 16]} />
          {fgMat}
        </mesh>
        <mesh ref={handleB}>
          <sphereGeometry args={[0.055, 20, 16]} />
          {fgMat}
        </mesh>
      </group>

      {/* pen tool */}
      <group ref={pen} position={anchors[0].toArray()}>
        <group scale={0.62}>
          <mesh geometry={nib}>{accentMat}</mesh>
          <RoundedBox args={[1.0, 0.32, 0.3]} radius={0.08} smoothness={4} position={[0, 1.86, 0]}>
            <meshPhysicalMaterial color="#1b1b1d" roughness={0.3} clearcoat={1} clearcoatRoughness={0.2} />
          </RoundedBox>
        </group>
      </group>

      {/* selection cursor with a multiplayer-style name tag */}
      <group ref={cursor} position={[0.9, 0.2, 0.6]} scale={mobile ? 0.5 : 0.55}>
        <mesh geometry={arrow}>
          <meshPhysicalMaterial color={p.fg} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

/** Sizes and places the vignette relative to the visible viewport. */
function Rig({ mobile, children }: { mobile: boolean; children: React.ReactNode }) {
  const { viewport } = useThree();
  const h = viewport.height, w = viewport.width;
  // composition is ~3.6 units wide, ~2.6 tall
  const scale = mobile ? Math.min((w * 0.8) / 3.6, (h * 0.3) / 2.6) : Math.min((w * 0.34) / 3.6, (h * 0.52) / 2.6);
  const x = mobile ? 0 : w * 0.2;
  const y = mobile ? h * 0.28 : h * 0.05;
  return <group position={[x, y, 0]} scale={scale}>{children}</group>;
}

export default function PenScene({ mobile = false, eventSource }: { mobile?: boolean; eventSource?: React.RefObject<HTMLElement | null> }) {
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
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <directionalLight position={[-4, -1, 3]} intensity={0.8} color="#fff1dc" />
      <Rig mobile={mobile}>
        <Vignette p={palette} mobile={mobile} />
      </Rig>
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 1.5, 1]} />
        <Lightformer form="rect" intensity={2} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 1.5, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[2, 2, 4]} scale={1.5} />
      </Environment>
    </Canvas>
  );
}
