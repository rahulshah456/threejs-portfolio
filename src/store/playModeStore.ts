import { create } from 'zustand';

interface PlayModeState {
  isPlaying: boolean;
  cityOpacity: number;
  expertiseOpacity: number;
  togglePlay: () => void;
  setCityOpacity: (opacity: number) => void;
  setExpertiseOpacity: (opacity: number) => void;
}

export const usePlayMode = create<PlayModeState>(set => ({
  isPlaying: false,
  cityOpacity: 1,
  expertiseOpacity: 0,
  togglePlay: () =>
    set(s => ({
      isPlaying: !s.isPlaying,
      ...(!s.isPlaying && { cityOpacity: 1 }),
    })),
  setCityOpacity: (opacity: number) => set({ cityOpacity: opacity }),
  setExpertiseOpacity: (opacity: number) => set({ expertiseOpacity: opacity }),
}));
