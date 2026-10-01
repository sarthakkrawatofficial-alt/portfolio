"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";

const LIME = new THREE.Color("#C8FF2E");

function Knurl({ y, h, r }: { y: number; h: number; r: number }) {
  // Grip band: ridged geometry built from a lathe profile with fine teeth.
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(r, r, h, 160, 1, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const a = Math.atan2(z, x);
      const k = 1 + 0.018 * Math.sign(Math.sin(a * 80));
      pos.setX(i, x * k); pos.setZ(i, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, [h, r]);
  return (
    <mesh geometry={geo} position={[0, y, 0]}>
      <meshStandardMaterial color="#121212" metalness={0.6} roughness={0.45} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Glow() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(200,255,46,0.22)");
    g.addColorStop(0.3, "rgba(200,255,46,0.06)");
    g.addColorStop(1, "rgba(200,255,46,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[0, 0, -2.5]}>
      <planeGeometry args={[7, 7]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Lens({ mobile }: { mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const blades = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const p = Math.min(scrollState.y / vh, 1.5); // 0 → 1 across the hero
    const px = state.pointer.x, py = state.pointer.y;
    // follow the mouse
    const tx = -0.32 - py * 0.35 + p * 0.9;
    const ty = -0.62 + px * 0.6 + p * 2.2;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 4, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 4, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, p * 1.6, 5, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, px * 0.25, 3, dt);
    const s = 1 - p * 0.22;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 5, dt));
    // aperture breathes with scroll velocity
    if (blades.current) blades.current.rotation.z += dt * (0.25 + Math.min(Math.abs(scrollState.velocity) * 0.05, 2));
    if (ring.current) ring.current.emissiveIntensity = 2.2 + Math.sin(state.clock.elapsedTime * 2) * 0.6;
  });

  const chrome = <meshStandardMaterial color="#e9e9e9" metalness={1} roughness={0.08} envMapIntensity={1.4} />;
  const dark = <meshStandardMaterial color="#0b0b0b" metalness={0.8} roughness={0.25} />;

  return (
    <group ref={group} rotation={[-0.32, -0.62, 0]}>
      {/* barrel is built along Y, rotate so the glass faces +Z */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* front chrome hood */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[1.22, 1.18, 0.34, 96, 1, true]} />
          {chrome}
        </mesh>
        <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.05, 24, 128]} />
          {chrome}
        </mesh>
        {/* lime accent ring (bloom) */}
        <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.185, 0.022, 16, 128]} />
          <meshStandardMaterial ref={ring} color={LIME} emissive={LIME} emissiveIntensity={3.5} toneMapped={false} />
        </mesh>
        {/* grip */}
        <Knurl y={0.36} h={0.62} r={1.16} />
        {/* body */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[1.1, 1.1, 0.62, 96]} />
          {chrome}
        </mesh>
        <Knurl y={-0.66} h={0.2} r={1.08} />
        {/* mount */}
        <mesh position={[0, -0.92, 0]}>
          <cylinderGeometry args={[0.92, 1.0, 0.34, 96]} />
          {chrome}
        </mesh>
        <mesh position={[0, -1.12, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.08, 64]} />
          {dark}
        </mesh>
        {/* inner tube (dark) so the glass refracts depth */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[1.02, 1.02, 0.6, 64, 1, true]} />
          <meshStandardMaterial color="#050505" side={THREE.BackSide} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.02, 64]} />
          <meshStandardMaterial color="#030303" roughness={0.5} />
        </mesh>
      </group>

      {/* aperture blades */}
      <group ref={blades} position={[0, 0, 0.4]}>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, i * 0.004]} rotation={[0, 0, a + 1.15]}>
              <boxGeometry args={[0.95, 0.42, 0.01]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
            </mesh>
          );
        })}
        <mesh position={[0, 0, -0.05]}>
          <circleGeometry args={[0.3, 48]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      </group>

      {/* front glass element */}
      <mesh position={[0, 0, 0.66]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.42, 1]}>
        <sphereGeometry args={[1.03, 96, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <MeshTransmissionMaterial
          samples={mobile ? 4 : 8}
          resolution={mobile ? 256 : 768}
          thickness={1.4}
          roughness={0.02}
          ior={1.45}
          chromaticAberration={mobile ? 0.02 : 0.08}
          anisotropicBlur={0.1}
          distortion={0.25}
          distortionScale={0.4}
          temporalDistortion={0.08}
          iridescence={1}
          iridescenceIOR={1.25}
          iridescenceThicknessRange={[100, 420]}
          clearcoat={1}
          backside={!mobile}
          backsideThickness={0.5}
          color="#ffffff"
          attenuationColor="#e8ffd0"
          attenuationDistance={3}
        />
      </mesh>
      {/* rear glass hint */}
      <mesh position={[0, 0, 0.52]} scale={[1, 1, 0.18]}>
        <sphereGeometry args={[0.98, 64, 32]} />
        <meshPhysicalMaterial color="#9aff7a" transmission={1} roughness={0} thickness={0.4} ior={1.3} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Satellites() {
  // small chrome & glass shapes orbiting the lens for depth
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.08; });
  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={1.4} floatIntensity={1.2}>
        <RoundedBox args={[0.42, 0.42, 0.42]} radius={0.1} position={[2.25, 1.15, -0.6]}>
          <meshStandardMaterial color="#f2f2f2" metalness={1} roughness={0.12} />
        </RoundedBox>
      </Float>
      <Float speed={1.6} rotationIntensity={2} floatIntensity={1.6}>
        <mesh position={[-2.2, -1.2, 0.2]}>
          <torusGeometry args={[0.28, 0.1, 24, 64]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.6} metalness={0.4} roughness={0.2} />
        </mesh>
      </Float>
      <Float speed={2.4} rotationIntensity={0.6} floatIntensity={2}>
        <mesh position={[1.9, -1.5, 0.6]}>
          <icosahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#d9d9d9" metalness={1} roughness={0.05} />
        </mesh>
      </Float>
    </group>
  );
}

/** Sizes and places the lens relative to the visible viewport so it never overflows. */
function Rig({ mobile, children }: { mobile: boolean; children: React.ReactNode }) {
  const { viewport } = useThree();
  const h = viewport.height, w = viewport.width;
  // lens is ~2.5 units across at scale 1
  const scale = mobile ? Math.min((w * 0.56) / 2.5, (h * 0.28) / 2.5) : Math.min((h * 0.5) / 2.5, (w * 0.36) / 2.5);
  const x = mobile ? 0 : w * 0.25;
  const y = mobile ? h * 0.29 : h * 0.04;
  return <group position={[x, y, 0]} scale={scale}>{children}</group>;
}

export default function LensScene({ mobile = false, eventSource }: { mobile?: boolean; eventSource?: React.RefObject<HTMLElement | null> }) {
  return (
    <Canvas
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#070707"]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <pointLight position={[-3, -2, 2]} intensity={3} color="#C8FF2E" />
      <Rig mobile={mobile}>
        <Glow />
        <Lens mobile={mobile} />
        {!mobile && <Satellites />}
      </Rig>
      {/* Procedural studio HDRI — no network fetch */}
      <Environment resolution={mobile ? 128 : 256} frames={1}>
        <color attach="background" args={["#050505"]} />
        <Lightformer form="rect" intensity={4} position={[0, 5, -4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[8, 1.4, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[8, 1.4, 1]} />
        <Lightformer form="ring" color="#C8FF2E" intensity={1.5} position={[3, 3, 4]} scale={1.5} />
        <Lightformer form="rect" color="#ffffff" intensity={1.5} position={[0, -4, 3]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} />
      </Environment>
      <EffectComposer multisampling={mobile ? 0 : 4}>
        <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={mobile ? 0.7 : 0.9} radius={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
