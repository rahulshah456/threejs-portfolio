// Top-level type for all projects data (matches JSON structure)
export type ProjectsData = {
  projects: ProjectWithPages[];
};
import type { CSSProperties } from 'react';

export interface CSSInterface {
  [key: string]: CSSProperties;
}

export interface ProjectButton {
  text: string;
  icon: string;
  isPrimary: boolean;
  buttonType: 'navigation' | 'link';
  url?: string;
  navigationPath?: string;
  disabled: boolean;
}

// Mirrors DB `projects` table
export interface Project {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  position: number;
  goal: string | null;
}

// Mirrors DB `project_pages` table
export interface ProjectPageRecord {
  id: string;
  project_id: string;
  page_number: number;
  header: string;
  message: string | null;
  media_type: string | null;
  media_path: string | null;
  show_vignette: boolean;
  show_buttons: boolean;
  buttons: ProjectButton[];
  created_at: string;
  updated_at: string;
}

// Client-side join of Project with its pages
export interface ProjectWithPages extends Project {
  pages: ProjectPageRecord[];
}
