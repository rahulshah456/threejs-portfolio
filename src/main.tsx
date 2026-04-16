import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Lenis disabled: using drei ScrollControls for scroll
import setupLocatorUI from '@locator/runtime';
// import Lenis from 'lenis';
import './index.css';
import App from './App.tsx';

// const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
// function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
// requestAnimationFrame(raf);

// Initialize LocatorJS in development mode
if (import.meta.env.DEV) {
  console.log('dev mode on!');
  setupLocatorUI();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
