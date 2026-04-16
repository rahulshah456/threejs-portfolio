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

  console.log('ProjectPage render', projectData);

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
          height: 'auto',
          width: '100%',
          marginTop: '1rem',
          userSelect: 'none',
          display: 'flex',
          gap: '1rem',
        }}
      >
        <span style={{ flex: '3.5', fontSize: '1.25rem', fontWeight: 'bold' }}>{header}</span>
        <span style={{ flex: '1' }} />
        <span style={{ flex: '3', fontSize: '0.875rem' }}>
          {message
            ? message.split(/\n+/).map((para, i) => (
                <p key={i} style={{ margin: 0, marginBottom: '0.5em' }}>
                  {para}
                </p>
              ))
            : null}
        </span>
        {index === 0 && (
          <span
            style={{
              flex: '1',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {projectData.tags.join(', ')}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
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
