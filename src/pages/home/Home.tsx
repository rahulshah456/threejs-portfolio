import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useOrientation } from '@uidotdev/usehooks';
import City from '../../components/city/City';
import styles from './index.css';

// Static text content
const MAIN_NAME = 'Rahul Kumar Shah';
const TITLE_LINE_1 = 'Full Stack Developer';
const TITLE_LINE_2 = '4+ Years Experience';
const TITLE_SEPARATOR = ' | ';

const Home = () => {
  const orientation = useOrientation();
  const isPortrait = orientation?.type?.includes('portrait') ?? false;

  return (
    <Canvas
      style={styles.canvas}
      shadows
      camera={{ position: [0, 2, 14], fov: 20, near: 1, far: 500 }}
      onCreated={({ scene }) => {
        const color = 0xffc50f;
        scene.background = new THREE.Color(color);
        scene.fog = new THREE.Fog(color, 10, 16);
      }}
    >
      <ambientLight intensity={4} />
      <spotLight position={[5, 5, 5]} intensity={20} angle={0.3} penumbra={0.1} castShadow />
      <Html
        center
        style={{
          ...styles.htmlWrapper,
          textAlign: isPortrait ? 'left' : 'center',
        }}
      >
        <span style={styles.mainHeading}>{MAIN_NAME}</span>
        {isPortrait ? (
          <div style={styles.portraitContainer}>
            <span style={styles.portraitSubtitle}>{TITLE_LINE_1}</span>
            <span style={styles.portraitSubtitle}>{TITLE_LINE_2}</span>
          </div>
        ) : (
          <span style={styles.landscapeSubtitle}>
            {TITLE_LINE_1}
            {TITLE_SEPARATOR}
            {TITLE_LINE_2}
          </span>
        )}
      </Html>
      <pointLight position={[0, 6, 0]} intensity={0.5} />
      <City />
    </Canvas>
  );
};

export default Home;
