import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProjectStore } from '../store/projectStore';
import type { Project, ProjectPageRecord, ProjectWithPages } from '../utils/interfaces';

const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('created_at');

  if (error) throw error;
  return data as Project[];
};

const fetchProjectPages = async (): Promise<ProjectPageRecord[]> => {
  const { data, error } = await supabase
    .from('project_pages')
    .select('*')
    .order('project_id')
    .order('page_number');

  if (error) throw error;
  return data as ProjectPageRecord[];
};

export const useProjectsData = () => {
  const setProjectsWithPages = useProjectStore(s => s.setProjectsWithPages);

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const pagesQuery = useQuery({
    queryKey: ['project_pages'],
    queryFn: fetchProjectPages,
  });

  useEffect(() => {
    if (projectsQuery.data && pagesQuery.data) {
      const joined: ProjectWithPages[] = projectsQuery.data.map(project => ({
        ...project,
        pages: pagesQuery.data
          .filter(page => page.project_id === project.id)
          .sort((a, b) => a.page_number - b.page_number),
      }));

      setProjectsWithPages(joined);
    }
  }, [projectsQuery.data, pagesQuery.data, setProjectsWithPages]);

  return {
    isLoading: projectsQuery.isLoading || pagesQuery.isLoading,
    isError: projectsQuery.isError || pagesQuery.isError,
  };
};
