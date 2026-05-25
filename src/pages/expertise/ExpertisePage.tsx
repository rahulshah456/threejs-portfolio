import MagicBento from '../../components/MagicBento';
import expertiseData from './expertiseData';
import styles from './index.css.tsx';

const ExpertisePage = () => {
  return (
    <div style={styles.page}>
      <MagicBento
        items={expertiseData}
        glowColor="212, 160, 23"
        enableStars
        enableSpotlight
        enableBorderGlow
        enableTilt
        enableMagnetism
        clickEffect
      />
    </div>
  );
};

export default ExpertisePage;
