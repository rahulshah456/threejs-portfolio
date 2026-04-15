import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import City from '../../components/city/City';
import PlayerBall from '../../components/city/PlayerBall';
import { useTheme } from '../../components/custom-hooks/useTheme';
import { usePlayMode } from '../../store/playModeStore';

const Home = () => {
  const { isDark } = useTheme();
  const isPlaying = usePlayMode(s => s.isPlaying);
  const cityOpacity = usePlayMode(s => s.cityOpacity);
  const sceneColor = isDark ? 0xffc50f : 0xff0000;
  const bgColor = isDark ? 0x000000 : 0xffffff;
  const get = useThree(state => state.get);
  const sceneColorObj = useRef(new THREE.Color(sceneColor));
  const bgColorObj = useRef(new THREE.Color(bgColor));

  useFrame(() => {
    const fog = get().scene.fog as THREE.Fog | null;
    if (!fog) return;
    sceneColorObj.current.setHex(sceneColor);
    bgColorObj.current.setHex(bgColor);

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
      <ambientLight intensity={4} />
      <spotLight position={[5, 5, 5]} intensity={20} angle={0.3} penumbra={0.1} castShadow />
      <pointLight position={[0, 6, 0]} intensity={0.5} />
      <City />
      {isPlaying && (
        <Physics gravity={[0, -9.81, 0]}>
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[30, 0.5, 30]} position={[0, -0.5, 0]} />
          </RigidBody>
          <PlayerBall />
        </Physics>
      )}
    </>
  );
};

export default Home;
