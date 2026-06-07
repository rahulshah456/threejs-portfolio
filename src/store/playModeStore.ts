import { create } from 'zustand';

interface PlayModeState {
  isPlaying: boolean;
  cityOpacity: number;
  expertiseOpacity: number;
  isAboutVisible: boolean;
  isContactVisible: boolean;
  isLaptopPlaying: boolean;
  togglePlay: () => void;
  setCityOpacity: (opacity: number) => void;
  setExpertiseOpacity: (opacity: number) => void;
  setAboutVisible: (visible: boolean) => void;
  setContactVisible: (visible: boolean) => void;
  setLaptopPlaying: (playing: boolean) => void;
}

export const usePlayMode = create<PlayModeState>(set => ({
  isPlaying: false,
  cityOpacity: 1,
  expertiseOpacity: 0,
  isAboutVisible: false,
  isContactVisible: false,
  isLaptopPlaying: false,
  togglePlay: () =>
    set(s => ({
      isPlaying: !s.isPlaying,
      ...(!s.isPlaying && { cityOpacity: 1 }),
    })),
  setCityOpacity: (opacity: number) => set({ cityOpacity: opacity }),
  setExpertiseOpacity: (opacity: number) => set({ expertiseOpacity: opacity }),
  setAboutVisible: (visible: boolean) => set({ isAboutVisible: visible }),
  setContactVisible: (visible: boolean) => set({ isContactVisible: visible }),
  setLaptopPlaying: (playing: boolean) => set({ isLaptopPlaying: playing }),
}));
