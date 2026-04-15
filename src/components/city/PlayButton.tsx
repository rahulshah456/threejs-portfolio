import { Button } from 'antd';
import { usePlayMode } from '../../store/playModeStore';

const PlayButton = () => {
  const { isPlaying, togglePlay } = usePlayMode();

  return (
    <Button
      onClick={togglePlay}
      type="primary"
      danger={isPlaying}
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        zIndex: 1000,
        fontWeight: 'bold',
      }}
    >
      {isPlaying ? '⏹ Stop' : '▶ Play'}
    </Button>
  );
};

export default PlayButton;
