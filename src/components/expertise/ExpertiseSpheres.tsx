/**
 * ExpertiseSpheres
 *
 * Renders as a fixed HTML overlay with its OWN R3F Canvas — completely separate
 * from the main city canvas. This prevents any interference with ScrollControls
 * (the scroll-reset bug was caused by Rapier Physics mounting inside the main canvas).
 *
 * Camera matches the reference code: position:[0,0,30], fov:17.5
 * Mouse tracking uses document.mousemove so pointer-events:none can stay on the
 * overlay — scroll wheel events pass through to drei ScrollControls unblocked.
 */

import * as THREE from 'three';
import { useRef, useReducer, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Decal } from '@react-three/drei';
import { BallCollider, Physics, RigidBody } from '@react-three/rapier';
import { easing } from 'maath';
import { usePlayMode } from '../../store/playModeStore';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// ------------- Palette -------------

const accents = ['#ff4060', '#ffcc00', '#20ffa0', '#4060ff'];

interface SphereConfig {
  color?: string;
  roughness?: number;
  metalness?: number;
  accent?: boolean;
  transparent?: boolean;
  opacity?: number;
  label?: string;
}

// Generates a canvas-based texture for the sticker text
function makeTextTexture(text: string): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  const fontSize = text.length > 9 ? 62 : 76;
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // dark outline so text reads on any sphere colour
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 4;
  ctx.strokeText(text, w / 2, h / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, w / 2, h / 2);
  return new THREE.CanvasTexture(canvas);
}

const shuffle = (accent = 0): SphereConfig[] => [
  { color: '#444', roughness: 0.1, metalness: 0.5, label: 'C++' },
  { color: '#444', roughness: 0.1, metalness: 0.5, label: 'Java' },
  { color: '#444', roughness: 0.1, metalness: 0.5, label: 'JavaScript' },
  { color: 'white', roughness: 0.1, metalness: 0.1, label: 'TypeScript' },
  { color: 'white', roughness: 0.1, metalness: 0.1, label: 'C#' },
  { color: 'white', roughness: 0.1, metalness: 0.1, label: 'React' },
  { color: accents[accent], roughness: 0.1, accent: true, label: '.NET' },
  { color: accents[accent], roughness: 0.1, accent: true, label: 'Three.js' },
  { color: accents[accent], roughness: 0.1, accent: true },
  { color: '#444', roughness: 0.1 },
  { color: '#444', roughness: 0.3 },
  { color: '#444', roughness: 0.3 },
  { color: 'white', roughness: 0.1 },
  { color: 'white', roughness: 0.2 },
  { color: 'white', roughness: 0.1 },
  { color: accents[accent], roughness: 0.1, accent: true, transparent: true, opacity: 0.5 },
  { color: accents[accent], roughness: 0.3, accent: true },
  { color: accents[accent], roughness: 0.1, accent: true },
];

// ------------- Global mouse (bypasses pointer-events:none on overlay) -------------

const globalMouse = { x: 0, y: 0 };

// ------------- Sphere -------------

const _impulse = new THREE.Vector3();

function Sphere({
  position,
  r = THREE.MathUtils.randFloatSpread,
  color = 'white',
  label,
  ...props
}: SphereConfig & { position?: [number, number, number]; r?: (n: number) => number }) {
  const api = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pos = useMemo<[number, number, number]>(() => position ?? [r(10), r(10), r(10)], []);
  const labelTex = useMemo(() => (label ? makeTextTexture(label) : null), [label]);

  useFrame((_s, delta) => {
    delta = Math.min(0.1, delta);
    if (api.current) {
      const t = api.current.translation();
      api.current.applyImpulse(_impulse.set(t.x, t.y, t.z).negate().multiplyScalar(0.2));
    }
    if (meshRef.current?.material) {
      easing.dampC(
        (meshRef.current.material as THREE.MeshStandardMaterial).color,
        color,
        0.2,
        delta
      );
    }
  });

  return (
    <RigidBody
      linearDamping={4}
      angularDamping={label ? 3 : 1}
      friction={0.1}
      position={pos}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[1]} />
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={props.roughness ?? 0.1}
          metalness={props.metalness ?? 0}
          transparent={!!props.transparent}
          opacity={props.opacity ?? 1}
        />
        {labelTex && (
          <Decal position={[0, 0, 1]} rotation={[0, 0, 0]} scale={[3.705, 1.853, 1]}>
            <meshBasicMaterial
              map={labelTex}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}
      </mesh>
    </RigidBody>
  );
}

// ------------- Pointer (follows global mouse, no pointer-events needed) -------------

const _ptrVec = new THREE.Vector3();

function Pointer() {
  const ref = useRef<any>(null);
  const { viewport } = useThree();
  useFrame(() => {
    ref.current?.setNextKinematicTranslation(
      _ptrVec.set((globalMouse.x * viewport.width) / 2, (globalMouse.y * viewport.height) / 2, 0)
    );
  });
  return (
    <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
      <BallCollider args={[1]} />
    </RigidBody>
  );
}

// ------------- Scene (inside own Canvas) -------------

function SphereScene({ connectors }: { connectors: SphereConfig[] }) {
  return (
    <>
      <Physics timeStep="vary" gravity={[0, 0, 0]}>
        <Pointer />
        {connectors.map((cfg, i) => (
          <Sphere key={i} {...cfg} />
        ))}
      </Physics>
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer
            form="circle"
            intensity={100}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={2}
          />
          <Lightformer
            form="circle"
            intensity={2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={8}
          />
          <Lightformer
            form="ring"
            color="#4060ff"
            intensity={80}
            onUpdate={self => self.lookAt(0, 0, 0)}
            position={[10, 10, 0]}
            scale={10}
          />
        </group>
      </Environment>
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.1} intensity={0.9} levels={7} />
      </EffectComposer>
    </>
  );
}

// ------------- HTML overlay wrapper (NOT inside the city canvas) -------------

const ExpertiseSpheres = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [accent, cycleAccent] = useReducer((s: number) => (s + 1) % accents.length, 0);
  const connectors = useMemo(() => shuffle(accent), [accent]);

  // Track mouse globally — pointer-events:none prevents canvas from receiving events,
  // so we read from document directly and feed coords to the Pointer rigid body.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      globalMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  // Imperatively drive CSS opacity — avoids React re-renders at 60fps
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.opacity = String(usePlayMode.getState().expertiseOpacity);
    }
    return usePlayMode.subscribe(state => {
      if (wrapperRef.current) {
        wrapperRef.current.style.opacity = String(state.expertiseOpacity);
      }
    });
  }, []);

  return (
    <div
      ref={wrapperRef}
      onClick={cycleAccent}
      style={{
        position: 'fixed',
        inset: 0,
        opacity: 0,
        // pointer-events:none lets scroll wheel pass to the drei ScrollControls underneath
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <Canvas
        flat
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0, 30], fov: 17.5, near: 10, far: 40 }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <SphereScene connectors={connectors} />
      </Canvas>
    </div>
  );
};

export default ExpertiseSpheres;
