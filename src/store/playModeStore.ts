import { create } from 'zustand';

interface PlayModeState {
  isPlaying: boolean;
  cityOpacity: number;
  togglePlay: () => void;
  setCityOpacity: (opacity: number) => void;
}

export const usePlayMode = create<PlayModeState>(set => ({
  isPlaying: false,
  cityOpacity: 1,
  togglePlay: () =>
    set(s => ({
      isPlaying: !s.isPlaying,
      ...(!s.isPlaying && { cityOpacity: 1 }),
    })),
  setCityOpacity: (opacity: number) => set({ cityOpacity: opacity }),
}));
