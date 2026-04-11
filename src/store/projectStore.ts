import { create } from 'zustand';
import type { ProjectWithPages } from '../utils/interfaces';

interface ProjectStore {
  projects: ProjectWithPages[];
  setProjectsWithPages: (projects: ProjectWithPages[]) => void;
}

export const useProjectStore = create<ProjectStore>(set => ({
  projects: [],
  setProjectsWithPages: projects => set({ projects }),
}));
