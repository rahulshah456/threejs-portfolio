import useEmblaCarousel from 'embla-carousel-react';
import { Button } from 'antd';
import ImageCard from './ImageCard';
import { useEmblaNavigation } from '../../components/custom-hooks/useEmblaNavigation';
import { useEmblaSelectedSnap } from '../../components/custom-hooks/useEmblaSelectedSnap';
import type { ProjectWithPages } from '../../utils/interfaces';
import styles from './index.css.tsx';

interface ProjectPageProps {
  projectData: ProjectWithPages;
}

const ProjectPage = ({ projectData }: ProjectPageProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
  });

  const { pages } = projectData;

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    useEmblaNavigation(emblaApi);

  const selectedSnap = useEmblaSelectedSnap(emblaApi);

  return (
    <div style={styles.container}>
      <div style={styles.carouselWrapper}>
        <div style={styles.carouselViewport} ref={emblaRef}>
          <div style={styles.slidesTrack}>
            {pages.map((page, index) => (
              <div key={`card-${index}`} style={styles.slide}>
                <ImageCard
                  pageData={page}
                  projectName={projectData.name}
                  isCarouselActive={index === selectedSnap}
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          style={styles.navigationButtonPrev}
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
        >
          ←
        </Button>
        <Button
          style={styles.navigationButtonNext}
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
        >
          →
        </Button>
      </div>
    </div>
  );
};

export default ProjectPage;
