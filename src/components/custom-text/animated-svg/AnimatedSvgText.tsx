import React, { useRef } from 'react';
import MaskedTextGroup from './MaskedTextGroup';
import { useGsapTextAnim } from './useGsapTextAnim';

export const AnimatedSvgText: React.FC = () => {
  const leftRef = useRef<SVGGElement>(null);
  const rightRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useGsapTextAnim({
    leftRef,
    rightRef,
    svgRef,
  });

  return (
    <svg ref={svgRef} viewBox="0 0 1280 720">
      <defs>
        <mask id="maskLeft">
          <rect x="-50%" width="100%" height="100%" fill="#fff" />
        </mask>
        <mask id="maskRight">
          <rect x="50%" width="100%" height="100%" fill="#fff" />
        </mask>
      </defs>

      <g fontSize={150}>
        <MaskedTextGroup ref={leftRef} mask="url(#maskLeft)" fill="#fff" />
        <MaskedTextGroup ref={rightRef} mask="url(#maskRight)" fill="#aaa" />
      </g>
    </svg>
  );
};
