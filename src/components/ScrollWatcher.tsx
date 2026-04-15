import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { usePlayMode } from '../store/playModeStore';

interface ScrollWatcherProps {
  pages: number;
}

const ScrollWatcher = ({ pages }: ScrollWatcherProps) => {
  const scroll = useScroll();
  const setCityOpacity = usePlayMode(s => s.setCityOpacity);
  const prev = useRef(1);

  useFrame(() => {
    // Fade spans from mid-About through most of the Projects header page (1.3 pages total).
    const fadeStart = 1.5 / pages;
    const fadeEnd = 2.8 / pages;
    const t = Math.max(0, Math.min(1, (scroll.offset - fadeStart) / (fadeEnd - fadeStart)));
    const opacity = 1 - t;

    if (Math.abs(opacity - prev.current) > 0.001) {
      prev.current = opacity;
      setCityOpacity(opacity);
    }
  });

  return null;
};

export default ScrollWatcher;
