import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { useTheme } from './custom-hooks/useTheme';

// Dark:  gold · red · blue      (vivid — stands out on dark bg)
// Light: muted red · muted gold · blue  (softer — stands out on light bg)
const DARK_COLORS = ['#ffc50f', '#ff0000', '#1677ff'] as const;
const LIGHT_COLORS = ['#c23b22', '#d4a017', '#1677ff'] as const;

// Faster lerps = snappier; shorter trail = angular, boxy feel
const LERPS = [0.32, 0.19, 0.1] as const;
const TRAIL = 20;
const N = 3;
const LINEWIDTH = 8; // pixels — Line2 shader handles actual pixel width

// Each tube is split into 4 opacity bands from tail → tip.
// Each band is its own Line2 with a fixed lineMat.opacity so underlying
// content (images, etc.) genuinely shows through the fading tail.
const BAND_DEFS = [
  { start: 0, end: 5, opacity: 0.06 },
  { start: 4, end: 10, opacity: 0.22 },
  { start: 9, end: 15, opacity: 0.55 },
  { start: 14, end: 19, opacity: 1.0 },
] as const;

interface BandState {
  start: number;
  pts: number;
  gpu: Float32Array;
  lineGeo: LineGeometry;
  lineMat: LineMaterial;
  line2: Line2;
}

interface TubeState {
  smoothed: THREE.Vector3;
  ring: Float32Array; // TRAIL*3 ring storage
  head: number;
  fullGpu: Float32Array; // TRAIL*3 ordered oldest→newest
  bands: BandState[];
}

function buildTubes(): TubeState[] {
  return Array.from({ length: N }, () => {
    const ring = new Float32Array(TRAIL * 3);
    const fullGpu = new Float32Array(TRAIL * 3);
    for (let j = 0; j < TRAIL; j++) {
      ring[j * 3 + 1] = fullGpu[j * 3 + 1] = 2;
      ring[j * 3 + 2] = fullGpu[j * 3 + 2] = 10;
    }
    const bands: BandState[] = (
      BAND_DEFS as readonly { start: number; end: number; opacity: number }[]
    ).map(def => {
      const pts = def.end - def.start + 1;
      const gpu = new Float32Array(pts * 3);
      for (let j = 0; j < pts; j++) {
        gpu[j * 3 + 1] = 2;
        gpu[j * 3 + 2] = 10;
      }
      const lineGeo = new LineGeometry();
      // Seed geometry with a separate copy so band.gpu is only ever touched
      // inside useFrame, avoiding the React Compiler's "used in effect" warning.
      lineGeo.setPositions(new Float32Array(gpu));
      const lineMat = new LineMaterial({
        color: '#ffffff',
        linewidth: LINEWIDTH,
        opacity: def.opacity,
        transparent: true,
        depthTest: false,
        toneMapped: false,
      });
      const line2 = new Line2(lineGeo, lineMat);
      return { start: def.start, pts, gpu, lineGeo, lineMat, line2 };
    });
    return { smoothed: new THREE.Vector3(0, 2, 10), ring, head: 0, fullGpu, bands };
  });
}

const TubesScene = () => {
  const { isDark } = useTheme();
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const { size, scene } = useThree();

  // Function-pointer refs — the compiler sees these as opaque refs, not mutable data.
  // All Three.js objects live inside the scene effect closure, fully invisible to React.
  const tickRef = useRef<(cam: THREE.Camera) => void>(() => {});
  const setColorsRef = useRef<(c: readonly string[]) => void>(() => {});
  const setResolutionRef = useRef<(w: number, h: number) => void>(() => {});

  // Build tubes, wire up tick + helpers, add to scene. All Three.js state is
  // local to this closure — React Compiler cannot see or track it.
  useEffect(() => {
    const tubes = buildTubes();
    tubes.forEach(t => t.bands.forEach(b => scene.add(b.line2)));

    const ndcMouse = new THREE.Vector2();
    const rawWorld = new THREE.Vector3(0, 2, 10);
    const caster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -10);

    const onMove = (e: PointerEvent) => {
      ndcMouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    tickRef.current = (cam: THREE.Camera) => {
      caster.setFromCamera(ndcMouse, cam);
      caster.ray.intersectPlane(plane, rawWorld);
      for (let i = 0; i < N; i++) {
        const t = tubes[i];
        t.smoothed.lerp(rawWorld, LERPS[i]);
        const h = t.head;
        t.ring[h * 3] = t.smoothed.x;
        t.ring[h * 3 + 1] = t.smoothed.y;
        t.ring[h * 3 + 2] = t.smoothed.z;
        t.head = (h + 1) % TRAIL;
        const tail = t.head;
        for (let j = 0; j < TRAIL; j++) {
          const si = ((tail + j) % TRAIL) * 3;
          const di = j * 3;
          t.fullGpu[di] = t.ring[si];
          t.fullGpu[di + 1] = t.ring[si + 1];
          t.fullGpu[di + 2] = t.ring[si + 2];
        }
        for (const band of t.bands) {
          const off = band.start * 3;
          for (let j = 0; j < band.pts * 3; j++) band.gpu[j] = t.fullGpu[off + j];
          band.lineGeo.setPositions(band.gpu);
        }
      }
    };

    setColorsRef.current = c =>
      tubes.forEach((t, i) => t.bands.forEach(b => b.lineMat.color.set(c[i])));
    setResolutionRef.current = (w, h) =>
      tubes.forEach(t => t.bands.forEach(b => b.lineMat.resolution.set(w, h)));

    return () => {
      tickRef.current = () => {};
      setColorsRef.current = () => {};
      setResolutionRef.current = () => {};
      tubes.forEach(t => t.bands.forEach(b => scene.remove(b.line2)));
      window.removeEventListener('pointermove', onMove);
    };
  }, [scene]);

  useEffect(() => {
    setColorsRef.current(colors);
  }, [colors]);
  useEffect(() => {
    setResolutionRef.current(size.width, size.height);
  }, [size]);

  useFrame(({ camera }) => tickRef.current(camera));

  return (
    <EffectComposer>
      <Bloom intensity={1.5} luminanceThreshold={0.12} luminanceSmoothing={0.55} />
    </EffectComposer>
  );
};

// Overlay Canvas — transparent, pointer-events disabled, above all content.
// antialias:false + dpr cap = big win on integrated Intel HD graphics.
const TubesCursorEffect = () => (
  <Canvas
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999,
    }}
    camera={{ position: [0, 2, 14], fov: 20, near: 1, far: 500 }}
    gl={{ alpha: true, antialias: false }}
    dpr={[1, 1.5]}
  >
    <TubesScene />
  </Canvas>
);

export default TubesCursorEffect;
