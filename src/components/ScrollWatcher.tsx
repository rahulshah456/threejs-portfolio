import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { usePlayMode } from '../store/playModeStore';

interface ScrollWatcherProps {
  pages: number;
  expertiseStart: number;
}

const ScrollWatcher = ({ pages, expertiseStart }: ScrollWatcherProps) => {
  const scroll = useScroll();
  const setCityOpacity = usePlayMode(s => s.setCityOpacity);
  const setExpertiseOpacity = usePlayMode(s => s.setExpertiseOpacity);
  const prevCity = useRef(1);
  const prevExpertise = useRef(0);

  useFrame(() => {
    const offset = scroll.offset;

    // --- City fade ---
    const cityFadeStart = 1.5 / pages;
    const cityFadeEnd = 2.8 / pages;
    const cityT = Math.max(
      0,
      Math.min(1, (offset - cityFadeStart) / (cityFadeEnd - cityFadeStart))
    );
    const cityOpacity = 1 - cityT;
    if (Math.abs(cityOpacity - prevCity.current) > 0.001) {
      prevCity.current = cityOpacity;
      setCityOpacity(cityOpacity);
    }

    // --- Expertise spheres fade ---
    const expFadeInStart = (expertiseStart - 0.5) / pages;
    const expFadeInEnd = expertiseStart / pages;
    const expFadeOutStart = (expertiseStart + 2.0) / pages;
    const expFadeOutEnd = (expertiseStart + 2.5) / pages;

    let expertiseOpacity = 0;
    if (offset >= expFadeInStart && offset <= expFadeOutEnd) {
      const fadeIn = Math.max(
        0,
        Math.min(1, (offset - expFadeInStart) / (expFadeInEnd - expFadeInStart))
      );
      const fadeOut =
        1 -
        Math.max(0, Math.min(1, (offset - expFadeOutStart) / (expFadeOutEnd - expFadeOutStart)));
      expertiseOpacity = Math.min(fadeIn, fadeOut);
    }
    if (Math.abs(expertiseOpacity - prevExpertise.current) > 0.001) {
      prevExpertise.current = expertiseOpacity;
      setExpertiseOpacity(expertiseOpacity);
    }
  });

  return null;
};

export default ScrollWatcher;
