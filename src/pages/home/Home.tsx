import City from '../../components/city/City';
import { useTheme } from '../../components/custom-hooks/useTheme';

const Home = () => {
  const { isDark } = useTheme();
  const sceneColor = isDark ? 0xffc50f : 0xff0000;

  return (
    <>
      <color attach="background" args={[sceneColor]} />
      <fog attach="fog" args={[sceneColor, 10, 16]} />
      <ambientLight intensity={4} />
      <spotLight position={[5, 5, 5]} intensity={20} angle={0.3} penumbra={0.1} castShadow />
      <pointLight position={[0, 6, 0]} intensity={0.5} />
      <City />
    </>
  );
};

export default Home;
