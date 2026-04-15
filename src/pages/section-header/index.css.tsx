import type { CSSInterface } from '../../utils/interfaces';

const styles: CSSInterface = {
  page: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  title: {
    fontSize: 'clamp(4rem, 15vw, 14rem)',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    textAlign: 'center' as const,
    userSelect: 'none',
  },
};

export default styles;
