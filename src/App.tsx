import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Button, theme as antTheme } from 'antd';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import ScrollWatcher from './components/ScrollWatcher';
import About from './pages/about/About';
import Home from './pages/home/Home';
import ProjectPage from './pages/project/ProjectPage';
import { useProjectsData } from './hooks/useProjectsData';
import { useProjectStore } from './store/projectStore';
import LandingPage from './pages/landing/LandingPage';
import SectionHeader from './pages/section-header/SectionHeader';
import PlayButton from './components/city/PlayButton';
import { usePlayMode } from './store/playModeStore';
import { ThemeProvider, useTheme } from './components/custom-hooks/useTheme';

const queryClient = new QueryClient();

const ThemedBody = ({ children }: { children: ReactNode }) => {
  const { token } = antTheme.useToken();
  const { isDark } = useTheme();
  useEffect(() => {
    document.body.style.backgroundColor = token.colorBgBase;
    document.body.style.color = token.colorText;
    document.documentElement.style.setProperty('--scrollbar-color', isDark ? '#ffc50f' : '#ff0000');
  }, [token.colorBgBase, token.colorText, isDark]);
  return <>{children}</>;
};

const ProjectDataLoader = () => {
  useProjectsData();
  return null;
};

const SceneContent = () => {
  const projects = useProjectStore(s => s.projects);
  const isPlaying = usePlayMode(s => s.isPlaying);
  const pages = 3 + projects.length;

  return (
    <>
      <Home />
      {!isPlaying && (
        <ScrollControls pages={pages} damping={0.1}>
          <ScrollWatcher pages={pages} />
          <Scroll html>
            <LandingPage />
            <About />
            <SectionHeader title="Projects" />
            {projects
              .slice()
              .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
              .map(project => (
                <ProjectPage key={project.id} projectData={project} />
              ))}
          </Scroll>
        </ScrollControls>
      )}
    </>
  );
};

const App = () => {
  const { isDark, toggleTheme } = useTheme();
  const isPlaying = usePlayMode(s => s.isPlaying);

  useEffect(() => {
    if (isPlaying) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isPlaying]);

  return (
    <ConfigProvider
      theme={{ algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemedBody>
          <ProjectDataLoader />
          <div className="page-reveal-overlay" style={{ background: isDark ? '#000' : '#fff' }} />
          <Canvas
            style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
            shadows
            camera={{ position: [0, 2, 14], fov: 20, near: 1, far: 500 }}
          >
            <SceneContent />
          </Canvas>
          <Button
            onClick={toggleTheme}
            style={{
              position: 'fixed',
              bottom: '1rem',
              right: '1rem',
              padding: '1rem',
              zIndex: 1000,
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </Button>
          <PlayButton />
        </ThemedBody>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

const AppWithProviders = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithProviders;
