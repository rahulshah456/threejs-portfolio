import type { CSSInterface } from '../../utils/interfaces';

const styles: CSSInterface = {
  canvas: {
    width: '100vw',
    height: '100vh',
  },

  htmlWrapper: {
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'clamp(1rem, 4vw, 2rem)',
  },

  mainHeading: {
    color: 'white',
    fontSize: 'clamp(3rem, 6vw, 8rem)',
    fontWeight: '900',
    fontFamily: 'Valorax',
    textAlign: 'center',
    userSelect: 'none',
    pointerEvents: 'none',
  },

  portraitContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '1rem',
    gap: '0.5rem',
  },

  portraitSubtitle: {
    color: 'white',
    fontSize: 'clamp(0.875rem, 1.5vw, 2rem)',
    fontWeight: '300',
    fontFamily: 'Sulphur Point',
    letterSpacing: '0.25rem',
    userSelect: 'none',
    pointerEvents: 'none',
    textAlign: 'center',
  },

  landscapeSubtitle: {
    color: 'white',
    fontSize: 'clamp(0.875rem, 1.5vw, 2rem)',
    fontWeight: '300',
    fontFamily: 'Sulphur Point',
    letterSpacing: '0.75rem',
    userSelect: 'none',
    pointerEvents: 'none',
  },
};

export default styles;
