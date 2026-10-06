"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import { asset } from "@/lib/asset";

/*
 * Hero 3D: the panda mascot (modelled procedurally in Blender — see
 * blender/panda.py). The head nods to a beat and turns toward the cursor,
 * the body sways, and scrolling turns the whole figure.
 */

const MODEL = asset("/models/panda.glb");

/** Fine noise used as a bump map so fur reads as soft and fuzzy. */
function makeFurTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 90 + Math.random() * 165;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

function Panda() {
  const { scene } = useGLTF(MODEL, false, true);
  const root = useRef<THREE.Group>(null);
  const head = useMemo(() => scene.getObjectByName("HeadRig") ?? null, [scene]);
  const headBase = useMemo(() => (head ? head.rotation.clone() : new THREE.Euler()), [head]);

  // soften materials: fuzzy fur, matte fabric
  useEffect(() => {
    const fur = makeFurTexture();
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m || !("roughness" in m)) return;
      if (m.name.startsWith("Fur")) {
        m.bumpMap = fur;
        m.bumpScale = 0.8;
        m.roughness = 1;
      } else if (["Hoodie", "Pants", "Cream", "Backpack"].includes(m.name)) {
        m.bumpMap = fur;
        m.bumpScale = 0.25;
      }
      m.needsUpdate = true;
    });
  }, [scene]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const prog = Math.min(scrollState.y / (window.innerHeight || 800), 1.5);
    const { x: px, y: py } = state.pointer;
    const beat = Math.sin(t * 4.2);
    if (head) {
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, headBase.x - py * 0.22 + beat * 0.045, 6, dt);
      head.rotation.y = THREE.MathUtils.damp(head.rotation.y, headBase.y + px * 0.5, 5, dt);
      head.rotation.z = THREE.MathUtils.damp(head.rotation.z, headBase.z + Math.sin(t * 2.1) * 0.05, 4, dt);
    }
    if (root.current) {
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.42 + px * 0.25 + prog * 1.4, 3, dt);
      root.current.rotation.z = Math.sin(t * 2.1) * 0.02;
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, -1.12 + prog * 0.7, 4, dt) + Math.abs(Math.sin(t * 2.1)) * 0.004;
    }
  });

  return (
    <group ref={root} position={[0, -1.12, 0]} rotation={[0, -0.42, 0]}>
      <primitive object={scene} />
      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <circleGeometry args={[0.72, 48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Sizes and places the panda relative to the visible viewport. */
function Rig({ mobile, children }: { mobile: boolean; children: React.ReactNode }) {
  const { viewport } = useThree();
  const h = viewport.height, w = viewport.width;
  // model is ~2.25 units tall
  const scale = mobile ? Math.min((h * 0.3) / 2.25, (w * 0.6) / 1.5) : Math.min((h * 0.6) / 2.25, (w * 0.28) / 1.5);
  const x = mobile ? 0 : w * 0.24;
  const y = mobile ? h * 0.31 : h * 0.08;
  return <group position={[x, y, 0]} scale={scale}>{children}</group>;
}

export default function PandaScene({ mobile = false, eventSource }: { mobile?: boolean; eventSource?: React.RefObject<HTMLElement | null> }) {
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
      camera={{ position: [0, 0.2, 6.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 4]} intensity={2.4} />
      <directionalLight position={[-4, 2, 2]} intensity={0.9} color="#ffe9e2" />
      {/* warm accent rim from behind */}
      <directionalLight position={[-2, 3, -4]} intensity={2.2} color="#ee5636" />
      <Rig mobile={mobile}>
        <Suspense fallback={null}>
          <Panda />
        </Suspense>
      </Rig>
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 5, -3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload(MODEL, false, true);
