import type { CSSInterface } from '../../utils/interfaces';

const styles: CSSInterface = {
  page: {
    width: '100vw',
    height: '100vh',
    position: 'relative' as const,
    pointerEvents: 'auto',
  },
  title: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 'clamp(4rem, 15vw, 14rem)',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    userSelect: 'none',
    margin: 0,
    zIndex: 2,
    pointerEvents: 'none' as const,
  },
  canvasWrapper: {
    position: 'absolute' as const,
    inset: 0,
    cursor: 'pointer',
    zIndex: 1,
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  hint: {
    position: 'absolute' as const,
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.4)',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    userSelect: 'none',
    zIndex: 2,
  },
};

export default styles;
