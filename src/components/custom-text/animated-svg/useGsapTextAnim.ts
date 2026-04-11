import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import type { RefObject } from 'react';

type Params = {
  leftRef: RefObject<SVGGElement | null>;
  rightRef: RefObject<SVGGElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
};

export const useGsapTextAnim = ({ leftRef, rightRef, svgRef }: Params) => {
  useLayoutEffect(() => {
    if (!leftRef.current || !rightRef.current || !svgRef.current) return;

    const ctx = gsap.context(() => {
      /* ---------- Timeline 1 (skew / scale) ---------- */
      const tl = gsap.timeline({
        defaults: {
          duration: 2,
          yoyo: true,
          ease: 'power2.inOut',
        },
      });

      tl.fromTo(
        [leftRef.current, rightRef.current],
        {
          svgOrigin: '640 500',
          skewY: (i: number) => [-30, 15][i],
          scaleX: (i: number) => [0.6, 0.85][i],
          x: 200,
        },
        {
          skewY: (i: number) => [-15, 30][i],
          scaleX: (i: number) => [0.85, 0.6][i],
          x: -200,
        }
      ).play(0.5);

      /* ---------- Timeline 2 (text sliding) ---------- */
      const tl2 = gsap.timeline();

      const texts = svgRef?.current?.querySelectorAll('text');

      texts?.forEach((t, i) => {
        tl2.add(
          gsap.fromTo(
            t,
            { xPercent: -100, x: 700 },
            {
              duration: 1,
              xPercent: 0,
              x: 575,
              ease: 'sine.inOut',
            }
          ),
          (i % 3) * 0.2
        );
      });

      /* ---------- Pointer Interaction ---------- */
      const onPointerMove = (e: PointerEvent) => {
        tl.pause();
        tl2.pause();

        gsap.to([tl, tl2], {
          duration: 2,
          ease: 'power4',
          progress: e.clientX / window.innerWidth,
        });
      };

      window.addEventListener('pointermove', onPointerMove);

      return () => {
        window.removeEventListener('pointermove', onPointerMove);
      };
    }, svgRef);

    return () => ctx.revert();
  }, []);
};
