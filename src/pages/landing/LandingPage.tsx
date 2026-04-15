import { useEffect, useRef } from 'react';
import { useOrientation } from '@uidotdev/usehooks';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import styles from './index.css.tsx';

gsap.registerPlugin(SplitText);

const MAIN_NAME = 'Rahul Kumar Shah';
const TITLE_LINE_1 = 'Full Stack Developer';
const TITLE_LINE_2 = '4+ Years Experience';

const LandingPage = () => {
  const orientation = useOrientation();
  const isPortrait = orientation?.type?.includes('portrait') ?? false;
  const nameRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!nameRef.current) return;
    gsap.set(nameRef.current, { opacity: 0 });
    const nameSplit = SplitText.create(nameRef.current, { type: 'chars' });
    const nameAnim = gsap.from(nameSplit.chars, {
      opacity: 0,
      scale: 0.6,
      filter: 'blur(10px)',
      stagger: { each: 0.08, from: 'center' },
      duration: 0.9,
      ease: 'power2.out',
      delay: 1.25,
      onStart: () => {
        gsap.set(nameRef.current, { opacity: 1 });
      },
    });
    return () => {
      nameAnim.kill();
      nameSplit.revert();
    };
  }, []);

  useEffect(() => {
    if (!titleRef.current) return;
    gsap.set(titleRef.current, { opacity: 0, y: 10 });
    const titleAnim = gsap.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: 1.75,
    });
    return () => {
      titleAnim.kill();
    };
  }, []);

  return (
    <div style={{ ...styles.wrapper, textAlign: isPortrait ? 'left' : 'center' }}>
      <span ref={nameRef} style={styles.name}>
        {MAIN_NAME}
      </span>
      <span ref={titleRef} style={styles.title}>
        {isPortrait ? (
          <>
            <div>{TITLE_LINE_1}</div>
            <div>{TITLE_LINE_2}</div>
          </>
        ) : (
          `${TITLE_LINE_1} | ${TITLE_LINE_2}`
        )}
      </span>
    </div>
  );
};

export default LandingPage;
