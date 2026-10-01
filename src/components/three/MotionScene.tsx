"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

/*
 * Hero 3D: an "exploded" motion-graphics composition — stacked comp layers
 * (like 3D layers in a comp), a bezier motion path running through them with
 * keyframe diamonds, and a null that eases along the path leaving an
 * onion-skin trail. Mouse orbits it, scrolling explodes the layers apart.
 */

const LIME = new THREE.Color("#5B6630");
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const PANEL_W = 2.5;
const PANEL_H = 1.56;

function Panel({ z, index, children, active = false }: { z: number; index: number; children?: React.ReactNode; active?: boolean }) {
  return (
    <group position={[0, 0, z]} userData={{ baseZ: z, index }}>
      <RoundedBox args={[PANEL_W, PANEL_H, 0.035]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color={active ? "#f6f3e4" : "#fbf8f2"} metalness={0.05} roughness={0.55} transparent opacity={active ? 0.82 : 0.78} />
        <Edges threshold={30} color={active ? LIME : "#b8ad9b"} />
      </RoundedBox>
      {/* layer label bar, like a comp layer header */}
      <mesh position={[-PANEL_W / 2 + 0.32, PANEL_H / 2 - 0.13, 0.025]}>
        <planeGeometry args={[0.44, 0.07]} />
        <meshBasicMaterial color={active ? LIME : "#cfc5b4"} toneMapped={false} />
      </mesh>
      <mesh position={[PANEL_W / 2 - 0.14, PANEL_H / 2 - 0.13, 0.025]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color={index % 2 ? "#cfc5b4" : LIME} toneMapped={false} />
      </mesh>
      {children}
    </group>
  );
}

function PlayGlyph() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.22, -0.26);
    s.lineTo(0.3, 0);
    s.lineTo(-0.22, 0.26);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
    g.center();
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={[0, -0.02, 0.07]}>
      <meshStandardMaterial color={LIME} metalness={0.2} roughness={0.35} />
    </mesh>
  );
}

function Composition({ mobile }: { mobile: boolean }) {
  const root = useRef<THREE.Group>(null);
  const layers = useRef<THREE.Group>(null);
  const nullObj = useRef<THREE.Mesh>(null);
  const ghosts = useRef<(THREE.Mesh | null)[]>([]);
  const ring = useRef<THREE.Mesh>(null);
  const bars = useRef<THREE.Group>(null);

  // motion path through the layers
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.55, -0.8, 1.45),
        new THREE.Vector3(-0.75, 0.4, 0.7),
        new THREE.Vector3(0.15, -0.35, 0),
        new THREE.Vector3(0.95, 0.5, -0.7),
        new THREE.Vector3(1.6, -0.15, -1.45),
      ]),
    [],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.012, 8, false), [curve]);
  const keys = useMemo(() => [0, 0.25, 0.5, 0.75, 1].map((t) => curve.getPointAt(t)), [curve]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const vh = window.innerHeight || 800;
    const p = Math.min(scrollState.y / vh, 1.5);
    const { x: px, y: py } = state.pointer;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.22 - py * 0.25 + p * 0.35, 4, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.88 + px * 0.45 + p * 0.9, 4, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, p * 1.2, 5, dt);

    // scroll explodes the layer stack
    if (layers.current) {
      const spread = 1 + p * 1.2;
      for (const child of layers.current.children) {
        const base = child.userData.baseZ as number;
        child.position.z = THREE.MathUtils.damp(child.position.z, base * spread, 6, dt);
      }
    }

    // null eases along the path (ping-pong), onion-skin trail behind it
    const t = state.clock.elapsedTime * 0.32;
    const sample = (time: number) => {
      const cyc = time % 2;
      return easeInOutCubic(cyc < 1 ? cyc : 2 - cyc);
    };
    if (nullObj.current) {
      curve.getPointAt(sample(t), tmp);
      nullObj.current.position.copy(tmp);
      nullObj.current.rotation.y += dt * 2;
    }
    ghosts.current.forEach((m, i) => {
      if (!m) return;
      curve.getPointAt(sample(Math.max(0, t - (i + 1) * 0.035)), tmp);
      m.position.copy(tmp);
    });

    if (ring.current) ring.current.rotation.z += dt * 0.8;
    if (bars.current) {
      bars.current.children.forEach((b, i) => {
        b.scale.x = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.6 + i * 0.9));
      });
    }
  });

  const ghostCount = mobile ? 3 : 5;

  return (
    <group ref={root} rotation={[0.22, -0.88, 0]}>
      <group ref={layers}>
        {/* back: background layer with grid */}
        <Panel z={-1.05} index={0}>
          <gridHelper args={[2.2, 11, "#cdbfa8", "#e2d8c8"]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0.03]} scale={[1, 1, 0.6]} />
        </Panel>
        {/* shape layer */}
        <Panel z={-0.35} index={1}>
          <mesh ref={ring} position={[0.55, -0.05, 0.06]}>
            <torusGeometry args={[0.3, 0.05, 16, 64, Math.PI * 1.5]} />
            <meshStandardMaterial color="#2c2823" metalness={0.8} roughness={0.25} />
          </mesh>
        </Panel>
        {/* text layer: animated bars */}
        <Panel z={0.35} index={2}>
          <group ref={bars} position={[-0.95, 0.05, 0.04]}>
            {[0.18, 0, -0.18].map((y, i) => (
              <mesh key={i} position={[0.45, y, 0]}>
                <boxGeometry args={[0.9 - i * 0.18, 0.08, 0.02]} />
                <meshStandardMaterial color={i === 0 ? "#2c2823" : "#b5aa98"} roughness={0.5} />
              </mesh>
            ))}
          </group>
        </Panel>
        {/* front: play / output layer */}
        <Panel z={1.05} index={3} active>
          <PlayGlyph />
        </Panel>
      </group>

      {/* motion path + keyframes */}
      <mesh geometry={tube}>
        <meshBasicMaterial color={LIME} toneMapped={false} transparent opacity={0.85} />
      </mesh>
      {keys.map((k, i) => (
        <mesh key={i} position={k} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.065, 0]} />
          <meshStandardMaterial color={i % 2 ? "#2c2823" : LIME} metalness={0.3} roughness={0.3} />
        </mesh>
      ))}
      <mesh ref={nullObj}>
        <boxGeometry args={[0.13, 0.13, 0.13]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.25} roughness={0.35} />
      </mesh>
      {Array.from({ length: ghostCount }).map((_, i) => (
        <mesh key={i} ref={(m) => { ghosts.current[i] = m; }} scale={1 - (i + 1) * 0.12}>
          <boxGeometry args={[0.13, 0.13, 0.13]} />
          <meshBasicMaterial color={LIME} transparent opacity={0.45 - i * 0.08} toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Sizes and places the composition relative to the visible viewport. */
function Rig({ mobile, children }: { mobile: boolean; children: React.ReactNode }) {
  const { viewport } = useThree();
  const h = viewport.height, w = viewport.width;
  // composition is ~3.4 units across at scale 1
  const scale = mobile ? Math.min((w * 0.72) / 3.4, (h * 0.3) / 2.4) : Math.min((h * 0.56) / 2.4, (w * 0.36) / 3.4);
  const x = mobile ? 0 : w * 0.2;
  const y = mobile ? h * 0.27 : h * 0.03;
  return <group position={[x, y, 0]} scale={scale}>{children}</group>;
}

export default function MotionScene({ mobile = false, eventSource }: { mobile?: boolean; eventSource?: React.RefObject<HTMLElement | null> }) {
  // Only render while the hero is on screen (big win for scroll smoothness).
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = eventSource?.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [eventSource]);

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      dpr={mobile ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
    >
      <color attach="background" args={["#efe8dc"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight position={[-3, -2, 2]} intensity={1.2} color="#fff4e0" />
      <Rig mobile={mobile}>
        <Composition mobile={mobile} />
      </Rig>
      {/* Procedural studio environment for reflections — rendered once, no network fetch */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[8, 1.4, 1]} />
        <Lightformer form="rect" intensity={2} position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[8, 1.4, 1]} />
      </Environment>
    </Canvas>
  );
}
