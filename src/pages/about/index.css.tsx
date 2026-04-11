import type { CSSInterface } from '../../utils/interfaces';

const styles: CSSInterface = {
  page: {
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
    pointerEvents: 'auto',
    isolation: 'isolate',
  },
  content: {
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: 'clamp(2rem, 4vw, 4rem)',
    position: 'relative' as const,
    zIndex: 2,
  },
  heading: {
    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
    fontWeight: '900',
    color: '#fff',
  },
  statement: {
    fontSize: 'clamp(2rem, 5vw, 5rem)',
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  highlight: {
    fontWeight: '500',
    textDecoration: 'underline',
    textDecorationThickness: 'clamp(0.125rem, 0.25vw, 0.25rem)',
    color: '#fff',
    cursor: 'pointer',
    position: 'relative' as const,
    zIndex: 2,
  },
  imagesContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
  },
  image: {
    position: 'absolute' as const,
    height: '20vh',
    width: 'auto',
    opacity: 0,
    zIndex: -1,
    transform: 'scale(0.8)',
    objectFit: 'cover' as const,
  },
};

export default styles;
