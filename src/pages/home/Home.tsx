import City from '../../components/city/City';

const Home = () => {
  return (
    <>
      <color attach="background" args={[0xffc50f]} />
      <fog attach="fog" args={[0xffc50f, 10, 16]} />
      <ambientLight intensity={4} />
      <spotLight position={[5, 5, 5]} intensity={20} angle={0.3} penumbra={0.1} castShadow />
      <pointLight position={[0, 6, 0]} intensity={0.5} />
      <City />
    </>
  );
};

export default Home;
