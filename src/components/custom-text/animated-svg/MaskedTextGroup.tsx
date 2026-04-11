import { forwardRef } from 'react';

type Props = {
  mask: string;
  fill: string;
};

const MaskedTextGroup = forwardRef<SVGGElement, Props>(({ mask, fill }, ref) => {
  return (
    <g ref={ref} mask={mask} fill={fill}>
      <text y="120">CODE</text>
      <text y="250">DRIVEN</text>
      <text y="380">ANIMATION</text>
    </g>
  );
});

export default MaskedTextGroup;
