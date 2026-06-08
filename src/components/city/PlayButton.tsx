import { usePlayMode } from '../../store/playModeStore';

const PlayButton = () => {
  const { isPlaying, togglePlay } = usePlayMode();

  return (
    <button
      onClick={togglePlay}
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        zIndex: 1000,
        background: isPlaying ? 'rgba(255,60,60,0.15)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${isPlaying ? 'rgba(255,80,80,0.35)' : 'rgba(255,255,255,0.18)'}`,
        borderRadius: '8px',
        padding: '0.55rem 1.1rem',
        color: '#fff',
        fontSize: '0.85rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
      }}
    >
      {isPlaying ? '⏹ Stop' : '▶ Play'}
    </button>
  );
};

export default PlayButton;
