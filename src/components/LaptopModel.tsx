import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { LoopOnce } from 'three';
import type { Group } from 'three';
import { usePlayMode } from '../store/playModeStore';

const MODEL_URL = `${import.meta.env.VITE_CLOUDFLARE_R2_DEV_URL}/models/asus_tuf_dash_f15_laptop.glb`;

export const CLOSED_FRACTION = 0.428; // kept for debug panel display
const CLOSED_TIME = 3.616; // lid fully closed (fraction 0.428 of 8.458s)

export interface LaptopDebugState {
  time: number;
  duration: number;
  paused: boolean;
}

interface LaptopModelProps {
  onTick?: (state: LaptopDebugState) => void;
  onSeek?: (seek: (t: number) => void) => void;
  onTogglePlay?: (toggle: () => void) => void;
}

const LaptopModel = ({ onTick, onSeek, onTogglePlay }: LaptopModelProps) => {
  const groupRef = useRef<Group>(null!);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, groupRef);
  const isLaptopPlaying = usePlayMode(s => s.isLaptopPlaying);
  const isOpen = useRef(false);
  const hasMounted = useRef(false);
  const frameCounter = useRef(0);

  // One-time setup: configure action and seek to closed state
  useEffect(() => {
    const action = actions[names[0]];
    if (!action) return;
    const raw = action as unknown as { loop: number; clampWhenFinished: boolean };
    raw.loop = LoopOnce;
    raw.clampWhenFinished = true;
    action.play();
    action.paused = true;
    action.time = CLOSED_TIME;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names[0]]);

  // Expose seek and togglePlay callbacks to parent
  useEffect(() => {
    const action = actions[names[0]];
    if (!action) return;
    onSeek?.((t: number) => {
      action.time = t;
      action.paused = true;
    });
    onTogglePlay?.(() => {
      if (action.paused || !action.isRunning()) {
        action.paused = false;
        if (!action.isRunning()) action.play();
      } else {
        action.paused = true;
      }
    });
  }, [actions, names, onSeek, onTogglePlay]);

  // Play forward (open) or backward (close) on each click
  useEffect(() => {
    const action = actions[names[0]];
    if (!action) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const clip = action.getClip();

    if (!isOpen.current) {
      // Closed → Open: play forward from CLOSED_TIME to end
      const raw = action as unknown as { timeScale: number };
      raw.timeScale = 1;
      action.time = CLOSED_TIME;
      action.paused = false;
      if (!action.isRunning()) action.play();
      isOpen.current = true;
    } else {
      // Open → Closed: play backward from end to CLOSED_TIME
      const raw = action as unknown as { timeScale: number };
      raw.timeScale = -1;
      action.time = clip.duration;
      action.paused = false;
      if (!action.isRunning()) action.play();
      isOpen.current = false;
    }
  }, [isLaptopPlaying, actions, names]);

  useFrame(() => {
    const action = actions[names[0]];
    if (!action) return;

    // Stop reverse playback at closed position
    const raw = action as unknown as { timeScale: number };
    if (raw.timeScale < 0 && action.isRunning()) {
      if (action.time <= CLOSED_TIME) {
        action.time = CLOSED_TIME;
        action.paused = true;
      }
    }

    // Report state to parent every 3 frames
    if (onTick) {
      frameCounter.current++;
      if (frameCounter.current % 3 === 0) {
        onTick({
          time: action.time,
          duration: action.getClip().duration,
          paused: action.paused || !action.isRunning(),
        });
      }
    }
  });

  return (
    <group ref={groupRef} scale={[15, 15, 15]} rotation={[0, -Math.PI / 2, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
};

useGLTF.preload(MODEL_URL);

export default LaptopModel;
