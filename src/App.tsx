import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antTheme } from 'antd';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import ScrollWatcher from './components/ScrollWatcher';
import About from './pages/about/About';
import Home from './pages/home/Home';
import ProjectPage from './pages/project/ProjectPage';
import ExpertisePage from './pages/expertise/ExpertisePage';
import { useProjectsData } from './hooks/useProjectsData';
import { useProjectStore } from './store/projectStore';
import LandingPage from './pages/landing/LandingPage';
import SectionHeader from './pages/section-header/SectionHeader';
import PlayButton from './components/city/PlayButton';
import { usePlayMode } from './store/playModeStore';
import { ThemeProvider, useTheme } from './components/custom-hooks/useTheme';
import TubesCursorEffect from './components/TubesCursorEffect';
import ContactPage from './pages/contact/ContactPage';

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
  const pages = 6 + projects.length;
  const expertiseStart = 3 + projects.length;

  return (
    <>
      <Home />
      {!isPlaying && (
        <ScrollControls pages={pages} damping={0.1}>
          <ScrollWatcher pages={pages} expertiseStart={expertiseStart} />
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
            <SectionHeader title="Expertise" />
            <ExpertisePage />
            <ContactPage />
          </Scroll>
        </ScrollControls>
      )}
    </>
  );
};

const SPACE_FACTS = [
  'You\'re orbiting at city speed',
  'Gravity: 9.81 m/s²',
  'Mass accumulation detected',
  'Katamari singularity forming',
  'Event horizon: nearby',
  'Schwarzschild radius expanding',
  'Dark matter absorbed',
];

const ScoreHUD = () => {
  const score = usePlayMode(s => s.score);
  const mass = usePlayMode(s => s.mass);
  const sizePercent = usePlayMode(s => s.sizePercent);
  const fact = SPACE_FACTS[score % SPACE_FACTS.length];

  return (
    <div style={{
      position: 'fixed',
      top: '1.2rem',
      left: '1.2rem',
      zIndex: 2000,
      background: 'rgba(0,0,0,0.55)',
      border: '1px solid rgba(255,100,0,0.35)',
      borderRadius: '10px',
      padding: '0.75rem 1.1rem',
      backdropFilter: 'blur(10px)',
      color: '#fff',
      fontFamily: 'monospace',
      fontSize: '0.78rem',
      lineHeight: '1.7',
      minWidth: '190px',
      pointerEvents: 'none',
    }}>
      <div style={{ color: '#ff4400', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', letterSpacing: '0.06em' }}>
        ☄ ASTEROID MODE
      </div>
      <div><span style={{ color: '#ff9900' }}>ORBS</span> &nbsp;{score}</div>
      <div><span style={{ color: '#ff9900' }}>MASS</span> &nbsp;{mass}×</div>
      <div><span style={{ color: '#ff9900' }}>SIZE</span> &nbsp;{sizePercent}%</div>
      <div style={{ marginTop: '0.4rem', borderTop: '1px solid rgba(255,100,0,0.2)', paddingTop: '0.35rem', color: '#ffcc66', fontSize: '0.68rem', fontStyle: 'italic' }}>
        {fact}
      </div>
    </div>
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
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: isDark ? {} : { colorBgBase: '#e8ddd4' },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemedBody>
          <ProjectDataLoader />
          <div
            className="page-reveal-overlay"
            style={{ background: isDark ? '#000' : '#e8ddd4' }}
          />
          <Canvas
            style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
            shadows
            camera={{ position: [0, 2, 14], fov: 20, near: 1, far: 500 }}
          >
            <SceneContent />
          </Canvas>
          {!isPlaying && <TubesCursorEffect />}
          <button
            onClick={toggleTheme}
            style={{
              position: 'fixed',
              bottom: '1rem',
              right: '1rem',
              zIndex: 1000,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '8px',
              padding: '0.55rem 0.9rem',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <PlayButton />
          {isPlaying && <ScoreHUD />}
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
