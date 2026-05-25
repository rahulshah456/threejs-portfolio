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
    fontSize: 'clamp(8rem, 11vw, 16rem)',
    fontWeight: '900',
    // fontFamily: 'Valorax',
    userSelect: 'none',
    opacity: 0,
  },
  title: {
    fontSize: 'clamp(1rem, 2vw, 3rem)',
    fontWeight: '300',
    userSelect: 'none',
    marginTop: '-1.5rem',
    opacity: 0,
  },
};

export default styles;
