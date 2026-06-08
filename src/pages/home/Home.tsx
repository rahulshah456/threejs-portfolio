import * as THREE from 'three';
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Stars } from '@react-three/drei';
import City from '../../components/city/City';
import PlayerBall from '../../components/city/PlayerBall';
import PowerUps from '../../components/city/PowerUps';
import GravityGrid from '../../components/city/GravityGrid';
import { useTheme } from '../../components/custom-hooks/useTheme';
import { usePlayMode } from '../../store/playModeStore';

const DynamicLights = ({ isDark }: { isDark: boolean }) => {
  const orbitARef = useRef<THREE.PointLight>(null!);
  const orbitBRef = useRef<THREE.PointLight>(null!);
  const orbitCRef = useRef<THREE.PointLight>(null!);
  const pulseRef = useRef<THREE.PointLight>(null!);
  const sweepRef = useRef<THREE.SpotLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Orbit A — slow wide circle hovering above rooftops
    if (orbitARef.current) {
      orbitARef.current.position.x = Math.sin(t * 0.4) * 18;
      orbitARef.current.position.z = Math.cos(t * 0.4) * 18;
      orbitARef.current.position.y = 12 + Math.sin(t * 0.7) * 3;
    }

    // Orbit B — tighter faster circle at rooftop level
    if (orbitBRef.current) {
      orbitBRef.current.position.x = Math.sin(-t * 0.65 + 2) * 10;
      orbitBRef.current.position.z = Math.cos(-t * 0.65 + 2) * 10;
      orbitBRef.current.position.y = 9 + Math.cos(t * 0.9) * 2;
    }

    // Orbit C — high elliptical pass over the whole city
    if (orbitCRef.current) {
      orbitCRef.current.position.x = Math.sin(t * 0.22) * 25;
      orbitCRef.current.position.z = Math.cos(t * 0.22) * 15;
      orbitCRef.current.position.y = 16 + Math.sin(t * 0.4) * 4;
    }

    // Pulse — breathes at mid-city height
    if (pulseRef.current) {
      pulseRef.current.position.y = 8 + Math.sin(t * 1.5) * 2;
      pulseRef.current.intensity = 10 + Math.sin(t * 2.5) * 6;
    }

    // Sweep spotlight — rotates high overhead, beam sweeps streets
    if (sweepRef.current) {
      sweepRef.current.position.x = Math.sin(t * 0.3) * 12;
      sweepRef.current.position.z = Math.cos(t * 0.3) * 12;
      sweepRef.current.target.position.set(
        Math.sin(t * 0.3 + Math.PI) * 10,
        0,
        Math.cos(t * 0.3 + Math.PI) * 10
      );
      sweepRef.current.target.updateMatrixWorld();
    }
  });

  return <>
    {/* Static key + fill */}
    <directionalLight
      position={[30, 50, 20]} intensity={3} castShadow
      shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      shadow-camera-near={0.5} shadow-camera-far={200}
      shadow-camera-left={-60} shadow-camera-right={60}
      shadow-camera-top={60} shadow-camera-bottom={-60}
      shadow-bias={-0.001}
    />
    <directionalLight position={[-20, 20, -30]} intensity={1.2} />
    <directionalLight position={[0, 10, -40]} intensity={1.5} color={isDark ? '#ffc50f' : '#ff6600'} />

    {/* Static accent corners — elevated above rooftops */}
    <pointLight position={[12, 10, 12]} intensity={12} distance={28} decay={2} color={isDark ? '#1677ff' : '#0055cc'} />
    <pointLight position={[-12, 10, -12]} intensity={12} distance={28} decay={2} color={isDark ? '#ff0000' : '#cc0000'} />
    <pointLight position={[-12, 10, 12]} intensity={10} distance={28} decay={2} color={isDark ? '#ffc50f' : '#ff8800'} />
    <pointLight position={[12, 10, -12]} intensity={10} distance={28} decay={2} color={isDark ? '#1677ff' : '#0055cc'} />

    {/* Dynamic — orbiting */}
    <pointLight ref={orbitARef} intensity={12} distance={25} decay={2} color={isDark ? '#ff0066' : '#ff3300'} />
    <pointLight ref={orbitBRef} intensity={10} distance={20} decay={2} color={isDark ? '#00ffcc' : '#00aaff'} />
    <pointLight ref={orbitCRef} intensity={8} distance={30} decay={2} color={isDark ? '#ffc50f' : '#ffaa00'} />

    {/* Dynamic — pulsing ground bounce */}
    <pointLight ref={pulseRef} position={[0, 0.5, 0]} intensity={6} distance={30} decay={2} color={isDark ? '#ff8800' : '#ffaa44'} />

    {/* Dynamic — sweeping spotlight high above city */}
    <spotLight ref={sweepRef} position={[0, 25, 0]} intensity={60} angle={0.14} penumbra={0.5} distance={60} decay={2} color={isDark ? '#ffffff' : '#ffffee'} castShadow={false} />
  </>;
};


// Visible boundary — subtle grid + edge lines so player knows the play area
const CityBoundary = ({ isDark }: { isDark: boolean }) => {
  const color = isDark ? '#2a2a5a' : '#b09070';
  const edgeColor = isDark ? '#4444aa' : '#cc9966';
  const ref = useRef<THREE.GridHelper>(null!);

  // Set opacity after mount since GridHelper material isn't a JSX prop
  useEffect(() => {
    if (!ref.current) return;
    const mats = Array.isArray(ref.current.material) ? ref.current.material : [ref.current.material];
    mats.forEach(m => {
      (m as THREE.LineBasicMaterial).transparent = true;
      (m as THREE.LineBasicMaterial).opacity = 0.2;
      (m as THREE.LineBasicMaterial).needsUpdate = true;
    });
  }, []);

  return (
    <>
      {/* Subtle floor grid covering full play area */}
      <gridHelper ref={ref} args={[120, 20, edgeColor, color]} position={[0, 0.04, 0]} />
      {/* Glowing edge lines marking the hard boundary */}
      {[
        { pos: [ 60, 0,   0] as [number,number,number], rot: [0, 0, Math.PI/2] as [number,number,number], len: 120 },
        { pos: [-60, 0,   0] as [number,number,number], rot: [0, 0, Math.PI/2] as [number,number,number], len: 120 },
        { pos: [  0, 0,  60] as [number,number,number], rot: [0, 0, 0]         as [number,number,number], len: 120 },
        { pos: [  0, 0, -60] as [number,number,number], rot: [0, 0, 0]         as [number,number,number], len: 120 },
      ].map((e, i) => (
        <mesh key={i} position={e.pos} rotation={e.rot}>
          <boxGeometry args={[e.len, 0.04, 0.04]} />
          <meshBasicMaterial color={edgeColor} transparent opacity={0.55} />
        </mesh>
      ))}
    </>
  );
};

const Home = () => {
  const { isDark } = useTheme();
  const isPlaying = usePlayMode(s => s.isPlaying);
  const cityOpacity = usePlayMode(s => s.cityOpacity);
  const sceneColor = isDark ? 0xffc50f : 0xff0000;
  const bgColor = isDark ? 0x000000 : 0xffffff;
  const get = useThree(state => state.get);
  const sceneColorObj = useRef(new THREE.Color(sceneColor));
  const bgColorObj = useRef(new THREE.Color(bgColor));
  const ballMeshRef = useRef<THREE.Mesh>(null!);
  const ballRadiusRef = useRef(0.075);
  const ballPosRef = useRef(new THREE.Vector3());

  useFrame(() => {
    const fog = get().scene.fog as THREE.Fog | null;
    if (!fog) return;
    sceneColorObj.current.setHex(sceneColor);
    bgColorObj.current.setHex(bgColor);

    if (isPlaying) {
      // No fog in play mode — use lighting for depth instead
      fog.near = 500;
      fog.far = 600;
      return;
    }

    const t = 1 - cityOpacity; // 0 = city visible, 1 = city gone

    // Phase 1 (t: 0 → 0.6): contrast fog color drains to bgColor
    const colorT = Math.min(t / 0.6, 1);
    fog.color.lerpColors(sceneColorObj.current, bgColorObj.current, colorT);

    // Phase 2 (t: 0.4 → 1.0): fog wall closes in, delayed behind color change
    const fogT = Math.max(0, Math.min((t - 0.4) / 0.6, 1));
    fog.near = (1 - fogT) * 10;
    fog.far = 3 + (1 - fogT) * 13;
  });

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[sceneColor, 10, isPlaying ? 60 : 16]} />
      <ambientLight intensity={1.5} />
      <spotLight position={[5, 5, 5]} intensity={20} angle={0.3} penumbra={0.1} castShadow />
      <pointLight position={[0, 6, 0]} intensity={0.5} />
      {isPlaying && <DynamicLights isDark={isDark} />}
      <City />
      {isPlaying && <Stars radius={100} depth={50} count={5000} factor={10} saturation={0.3} fade speed={1} />}
      {isPlaying && <GravityGrid ballPosRef={ballPosRef} ballRadiusRef={ballRadiusRef} isDark={isDark} />}
      {isPlaying && <CityBoundary isDark={isDark} />}
      {isPlaying && (
        <Physics gravity={[0, -9.81, 0]}>
          <RigidBody type="fixed" colliders={false}>
            {/* Floor */}
            <CuboidCollider args={[60, 0.5, 60]} position={[0, -0.5, 0]} />
            {/* Boundary walls — invisible physics, prevents falling off */}
            <CuboidCollider args={[0.5, 10, 60]} position={[ 60, 5, 0]} />
            <CuboidCollider args={[0.5, 10, 60]} position={[-60, 5, 0]} />
            <CuboidCollider args={[60, 10, 0.5]} position={[0, 5,  60]} />
            <CuboidCollider args={[60, 10, 0.5]} position={[0, 5, -60]} />
          </RigidBody>
          <PlayerBall meshRef={ballMeshRef} ballRadiusRef={ballRadiusRef} ballPosRef={ballPosRef} />
          <PowerUps ballRef={ballMeshRef} ballRadiusRef={ballRadiusRef} />
        </Physics>
      )}
    </>
  );
};

export default Home;
