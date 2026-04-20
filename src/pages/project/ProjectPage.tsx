import { useMediaQuery } from 'react-responsive';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from 'antd';
import ImageCard from './ImageCard';
import { useEmblaNavigation } from '../../components/custom-hooks/useEmblaNavigation';
import { useEmblaSelectedSnap } from '../../components/custom-hooks/useEmblaSelectedSnap';
import type { ProjectWithPages } from '../../utils/interfaces';
import styles from './index.css.tsx';

interface Props {
  projectData: ProjectWithPages;
}

const ProjectPage = ({ projectData }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
  });
  const { pages } = projectData;

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    useEmblaNavigation(emblaApi);
  const selectedSnap = useEmblaSelectedSnap(emblaApi);

  const isTabletOrDesktop = useMediaQuery({ minWidth: 768 });

  const getPageContentInfo = (index: number) => {
    const page = pages?.[index];
    if (!page || index !== selectedSnap) return null;

    let header = `${projectData.name} - ${page.message}`;
    if (index !== 0) {
      header = page?.header;
    }

    let message = page?.message;
    if (index === 0) {
      message = projectData.goal;
    }

    return (
      <div
        style={{
          ...styles.pageContentInfo,
          flexDirection: isTabletOrDesktop ? 'row' : 'column',
        }}
      >
        <span style={styles.pageHeader}>{header}</span>
        <span style={styles.pageSpacer} />
        <span style={styles.pageMessage}>
          {index === 0 && <span style={{ fontWeight: '700' }}>GOAL</span>}
          {message
            ? message.split(/\n+/).map((para, i) => (
                <p key={i} style={{ margin: 0, marginBottom: '0.5em' }}>
                  {para}
                </p>
              ))
            : null}
        </span>
        {index === 0 && (
          <span style={styles.pageTechstack}>
            <span style={{ fontWeight: '700' }}>TECHSTACK</span>
            {projectData.tags.join(', ')}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        ...styles.container,
        borderTop: `1px solid red`,
        height: isTabletOrDesktop ? '100vmin' : '100vh',
      }}
    >
      <div style={styles.carouselWrapper}>
        <div ref={emblaRef}>
          <div style={styles.slidesTrack}>
            {pages?.map((page, index) => (
              <div key={`card-${index}`} style={styles.slide}>
                <ImageCard pageData={page} isCarouselActive={index === selectedSnap} />
                {getPageContentInfo(index)}
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
