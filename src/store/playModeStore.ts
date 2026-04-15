import { create } from 'zustand';

interface PlayModeState {
  isPlaying: boolean;
  togglePlay: () => void;
}

export const usePlayMode = create<PlayModeState>(set => ({
  isPlaying: false,
  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
}));
