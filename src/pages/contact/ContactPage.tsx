import { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import LaptopModel, { CLOSED_FRACTION } from '../../components/LaptopModel';
import type { LaptopDebugState } from '../../components/LaptopModel';
import { usePlayMode } from '../../store/playModeStore';
import styles from './index.css.tsx';

const DEBUG = true;

const ContactPage = () => {
  const isLaptopPlaying = usePlayMode(s => s.isLaptopPlaying);
  const setLaptopPlaying = usePlayMode(s => s.setLaptopPlaying);

  const [debugState, setDebugState] = useState<LaptopDebugState>({
    time: 0,
    duration: 0,
    paused: true,
  });
  const seekFnRef = useRef<((t: number) => void) | null>(null);
  const togglePlayFnRef = useRef<(() => void) | null>(null);

  const handleSeekRegister = useCallback((fn: (t: number) => void) => {
    seekFnRef.current = fn;
  }, []);
  const handleToggleRegister = useCallback((fn: () => void) => {
    togglePlayFnRef.current = fn;
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Contact Me</h2>

      <div
        style={styles.canvasWrapper}
        onClick={e => {
          if ((e.target as HTMLElement).closest('[data-debug]')) return;
          setLaptopPlaying(!isLaptopPlaying);
        }}
      >
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} style={styles.canvas} events={undefined}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={null}>
            <LaptopModel
              onTick={DEBUG ? setDebugState : undefined}
              onSeek={DEBUG ? handleSeekRegister : undefined}
              onTogglePlay={DEBUG ? handleToggleRegister : undefined}
            />
            <Environment preset="city" />
          </Suspense>
        </Canvas>

        {DEBUG && (
          <div
            data-debug="true"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '3.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.82)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 12,
              minWidth: 320,
              zIndex: 10,
              userSelect: 'none',
            }}
          >
            <div style={{ marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>
              🎬 Animation Debug
            </div>
            <div>
              Duration: <b>{debugState.duration.toFixed(3)}s</b>
            </div>
            <div>
              Time: <b>{debugState.time.toFixed(3)}s</b>
              &nbsp;|&nbsp; Fraction:{' '}
              <b>
                {debugState.duration ? (debugState.time / debugState.duration).toFixed(3) : '—'}
              </b>
            </div>
            <div>
              Status: <b>{debugState.paused ? 'paused' : 'playing'}</b>
            </div>
            <div style={{ marginTop: 8 }}>
              <input
                type="range"
                min={0}
                max={debugState.duration || 1}
                step={0.001}
                value={debugState.time}
                onChange={e => seekFnRef.current?.(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <button
              onClick={() => togglePlayFnRef.current?.()}
              style={{
                marginTop: 6,
                padding: '3px 12px',
                background: '#333',
                color: '#fff',
                border: '1px solid #666',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              {debugState.paused ? '▶ Play' : '⏸ Pause'}
            </button>
            <div style={{ marginTop: 8, color: '#aaa', fontSize: 11 }}>
              CLOSED_FRACTION = {CLOSED_FRACTION} → t=
              {debugState.duration ? (debugState.duration * CLOSED_FRACTION).toFixed(3) : '—'}s
            </div>
          </div>
        )}

        <div style={styles.hint}>
          {isLaptopPlaying ? 'Click to pause' : 'Click to play animation'}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
