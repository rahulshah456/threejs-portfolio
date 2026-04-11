import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import About from './pages/about/About';
import Home from './pages/home/Home';
import ProjectPage from './pages/project/ProjectPage';
import { useProjectsData } from './hooks/useProjectsData';
import { useProjectStore } from './store/projectStore';

const queryClient = new QueryClient();

function LazySection({ children, height = '100vh' }: { children: ReactNode; height?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasBeenVisible]);

  return (
    <div
      ref={ref}
      style={{ minHeight: hasBeenVisible ? undefined : height, backgroundColor: '#111' }}
    >
      {hasBeenVisible ? children : null}
    </div>
  );
}

function ProjectDataLoader() {
  useProjectsData();
  return null;
}

function AppContent() {
  const projects = useProjectStore(s => s.projects);

  return (
    <div style={{ width: '100vw', height: 'auto', overflowX: 'hidden' }}>
      <Home />
      <About />
      {projects.map(project => (
        <LazySection key={project.id}>
          <ProjectPage projectData={project} />
        </LazySection>
      ))}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectDataLoader />
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
