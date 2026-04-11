import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Aurora from '../../components/Aurora';

const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}${import.meta.env.VITE_SUPABASE_STORAGE_BUCKET}/about`;
import styles from './index.css.tsx';
import { useOrientation } from '@uidotdev/usehooks';

const About = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement | null }>({});
  const orientation = useOrientation();
  const isPortrait = orientation?.type?.includes('portrait') ?? false;

  useEffect(() => {
    const contentWrapper = contentRef.current;
    if (!contentWrapper) return;

    // Mouse move handler to make images follow cursor
    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(Object.values(imagesRef.current), {
        x: e.clientX,
        y: e.clientY,
        xPercent: -50,
        yPercent: -50,
        stagger: 0.05,
        duration: 0.3,
      });
    };

    contentWrapper.addEventListener('mousemove', handleMouseMove);

    // Setup hover handlers for each highlighted text
    const highlights = contentWrapper.querySelectorAll('[data-label]');
    highlights.forEach(highlight => {
      const label = (highlight as HTMLElement).dataset.label;
      if (!label) return;

      const handleMouseEnter = () => {
        const img = imagesRef.current[label];
        if (img) {
          gsap.to(img, { opacity: 1, scale: 1, duration: 0.3 });
          gsap.set(img, { zIndex: 1 });
        }
      };

      const handleMouseLeave = () => {
        const img = imagesRef.current[label];
        if (img) {
          gsap.to(img, { opacity: 0, scale: 0.8, duration: 0.3 });
          gsap.set(img, { zIndex: -1 });
        }
      };

      highlight.addEventListener('mouseenter', handleMouseEnter);
      highlight.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      contentWrapper.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div style={styles.page}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50%',
          zIndex: 0,
          transform: 'rotate(180deg)',
        }}
      >
        <Aurora
          colorStops={['#ffc50f', '#ff8c00', '#ff0000']}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
      </div>
      <div style={styles.imagesContainer}>
        <img
          ref={el => {
            imagesRef.current['designer-dev'] = el;
          }}
          src={`${baseUrl}/developer.png`}
          alt="Full-Stack designer and developer"
          style={styles.image}
          data-image="designer-dev"
        />
        <img
          ref={el => {
            imagesRef.current['india'] = el;
          }}
          src={`${baseUrl}/india.webp`}
          alt="India"
          style={styles.image}
          data-image="india"
        />
        <img
          ref={el => {
            imagesRef.current['wsp'] = el;
          }}
          src={`${baseUrl}/wsp.jpg`}
          alt="WSP"
          style={styles.image}
          data-image="wsp"
        />
        <img
          ref={el => {
            imagesRef.current['startups'] = el;
          }}
          src={`${baseUrl}/design.jpg`}
          alt="Early stage startups"
          style={styles.image}
          data-image="startups"
        />
        <img
          ref={el => {
            imagesRef.current['primebook'] = el;
          }}
          src={`${baseUrl}/primebook.png`}
          alt="PrimeBook"
          style={styles.image}
          data-image="primebook"
        />
      </div>

      <div ref={contentRef} style={styles.content}>
        <span style={{ ...styles.heading, letterSpacing: isPortrait ? '0.1rem' : '0.2rem' }}>
          HI, I'M RAHUL
        </span>
        <span style={styles.statement}>
          <span style={styles.highlight} data-label="designer-dev">
            Full-Stack designer and developer
          </span>{' '}
          based in{' '}
          <span style={styles.highlight} data-label="india">
            India
          </span>
          . Currently working at{' '}
          <span style={styles.highlight} data-label="wsp">
            WSP
          </span>{' '}
          and worked with Founders from{' '}
          <span style={styles.highlight} data-label="startups">
            early stage startups
          </span>{' '}
          like{' '}
          <span style={styles.highlight} data-label="primebook">
            PrimeBook
          </span>
          .
        </span>
      </div>
    </div>
  );
};

export default About;
