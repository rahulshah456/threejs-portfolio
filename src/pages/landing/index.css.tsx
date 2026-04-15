import type { CSSInterface } from '../../utils/interfaces';

const styles: CSSInterface = {
  wrapper: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    pointerEvents: 'none',
  },
  name: {
    color: 'white',
    fontSize: 'clamp(3rem, 6vw, 8rem)',
    fontWeight: '900',
    fontFamily: 'Valorax',
    userSelect: 'none',
    opacity: 0,
  },
  title: {
    color: 'white',
    fontSize: 'clamp(0.8rem, 1.5vw, 1.2rem)',
    fontWeight: '300',
    opacity: 0,
  },
};

export default styles;
