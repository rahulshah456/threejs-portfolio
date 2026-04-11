import { useCallback, useEffect, useState } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';

/** Keeps React state in sync with Embla's centered / selected slide index. */
export function useEmblaSelectedSnap(emblaApi: EmblaCarouselType | undefined): number {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    queueMicrotask(() => onSelect(emblaApi));
    emblaApi.on('reInit', onSelect).on('select', onSelect);

    return () => {
      emblaApi.off('reInit', onSelect).off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return selectedIndex;
}
