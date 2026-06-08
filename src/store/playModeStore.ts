import { create } from 'zustand';

interface PlayModeState {
  isPlaying: boolean;
  cityOpacity: number;
  expertiseOpacity: number;
  isAboutVisible: boolean;
  isContactVisible: boolean;
  score: number;
  mass: number;
  sizePercent: number;
  togglePlay: () => void;
  setCityOpacity: (opacity: number) => void;
  setExpertiseOpacity: (opacity: number) => void;
  setAboutVisible: (visible: boolean) => void;
  setContactVisible: (visible: boolean) => void;
  setScore: (score: number) => void;
  setMass: (mass: number) => void;
  setSizePercent: (pct: number) => void;
}

export const usePlayMode = create<PlayModeState>(set => ({
  isPlaying: false,
  cityOpacity: 1,
  expertiseOpacity: 0,
  isAboutVisible: false,
  isContactVisible: false,
  score: 0,
  mass: 1,
  sizePercent: 0,
  togglePlay: () =>
    set(s => ({
      isPlaying: !s.isPlaying,
      ...(!s.isPlaying && { cityOpacity: 1 }),
      // Reset score when stopping (s.isPlaying === true means we're stopping)
      ...(s.isPlaying && { score: 0, mass: 1, sizePercent: 0 }),
    })),
  setCityOpacity: (opacity: number) => set({ cityOpacity: opacity }),
  setExpertiseOpacity: (opacity: number) => set({ expertiseOpacity: opacity }),
  setAboutVisible: (visible: boolean) => set({ isAboutVisible: visible }),
  setContactVisible: (visible: boolean) => set({ isContactVisible: visible }),
  setScore: (score: number) => set({ score }),
  setMass: (mass: number) => set({ mass }),
  setSizePercent: (sizePercent: number) => set({ sizePercent }),
}));
