import { useState, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Button, theme as antTheme } from 'antd';
import About from './pages/about/About';
import Home from './pages/home/Home';
import ProjectPage from './pages/project/ProjectPage';
import LazySection from './components/LazySection';
import { useProjectsData } from './hooks/useProjectsData';
import { useProjectStore } from './store/projectStore';

const THEME_KEY = 'theme-preference';
const queryClient = new QueryClient();

const ThemedBody = ({ children }: { children: ReactNode }) => {
  const { token } = antTheme.useToken();
  useEffect(() => {
    document.body.style.backgroundColor = token.colorBgBase;
    document.body.style.color = token.colorText;
  }, [token.colorBgBase, token.colorText]);
  return <>{children}</>;
};

const ProjectDataLoader = () => {
  useProjectsData();
  return null;
};

const AppContent = () => {
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
};

const App = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved !== null ? saved === 'dark' : true;
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ConfigProvider
      theme={{ algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemedBody>
          <ProjectDataLoader />
          <AppContent />
          <Button
            onClick={toggleTheme}
            style={{ position: 'fixed', bottom: '1rem', right: '1rem', padding: '1rem' }}
          >
            {isDark ? '☀️' : '🌙'}
          </Button>
        </ThemedBody>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default App;
