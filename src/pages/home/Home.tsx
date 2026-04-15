import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import City from '../../components/city/City';
import PlayerBall from '../../components/city/PlayerBall';
import { useTheme } from '../../components/custom-hooks/useTheme';
import { usePlayMode } from '../../store/playModeStore';

const Home = () => {
  const { isDark } = useTheme();
  const isPlaying = usePlayMode(s => s.isPlaying);
  const sceneColor = isDark ? 0xffc50f : 0xff0000;

  return (
    <>
      <color attach="background" args={[sceneColor]} />
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
