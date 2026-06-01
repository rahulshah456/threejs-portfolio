import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTheme } from './custom-hooks/useTheme';

// Dark:  gold (#ffc50f) · red (#ff0000) · blue (#1677ff)
// Light: red (#ff0000)  · gold (#ffc50f) · blue (#1677ff)
const DARK_COLORS  = ['#ffc50f', '#ff0000', '#1677ff'] as const;
const LIGHT_COLORS = ['#ff0000', '#ffc50f', '#1677ff'] as const;

const LERPS   = [0.22, 0.13, 0.07];
const RADII   = [0.012, 0.009, 0.007];
const TRAIL   = 40;
const TOTAL   = TRAIL + 1;
const SEGMENTS = 28;

const TubesScene = () => {
  const { isDark } = useTheme();
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const ndcMouse  = useRef(new THREE.Vector2(0, 0));
  const rawWorld  = useRef(new THREE.Vector3(0, 2, 10));
  const raycaster = useRef(new THREE.Raycaster());
  const plane     = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), -10));

  const tubeData = useRef(
    Array.from({ length: 3 }, () => ({
      smoothed: new THREE.Vector3(0, 2, 10),
      history:  Array.from({ length: TOTAL }, () => new THREE.Vector3(0, 2, 10)),
    }))
  );
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ndcMouse.current.set(
        (e.clientX / window.innerWidth)  *  2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ camera }) => {
    raycaster.current.setFromCamera(ndcMouse.current, camera);
    raycaster.current.ray.intersectPlane(plane.current, rawWorld.current);

    for (let i = 0; i < 3; i++) {
      const data = tubeData.current[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      data.smoothed.lerp(rawWorld.current, LERPS[i]);
      data.history.shift();
      data.history.push(data.smoothed.clone());

      const curve  = new THREE.CatmullRomCurve3(data.history);
      const oldGeo = mesh.geometry;
      mesh.geometry = new THREE.TubeGeometry(curve, SEGMENTS, RADII[i], 8, false);
      oldGeo.dispose();
    }
  });

  return (
    <>
      {colors.map((color, i) => (
        <mesh key={i} ref={el => { meshRefs.current[i] = el; }}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      ))}
      <EffectComposer>
        <Bloom
          intensity={1.0}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.7}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
};

// Standalone transparent Canvas overlay — appears above all HTML content.
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
    gl={{ alpha: true, antialias: true }}
  >
    <TubesScene />
  </Canvas>
);

export default TubesCursorEffect;
