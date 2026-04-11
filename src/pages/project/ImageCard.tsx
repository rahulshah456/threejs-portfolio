import { useEffect, useRef } from 'react';
import { Button } from 'antd';
import { useWindowSize } from '@uidotdev/usehooks';
import type { ProjectPageRecord } from '../../utils/interfaces';
import { getIconComponent } from '../../utils/iconMapper';
import styles from './index.css.tsx';

interface Props {
  pageData: ProjectPageRecord;
  projectName: string;
  /** When false, video is paused (e.g. slide not centered in Embla). */
  isCarouselActive?: boolean;
}

const ImageCard = ({ pageData, projectName, isCarouselActive = true }: Props) => {
  const { width, height } = useWindowSize();
  const videoRef = useRef<HTMLVideoElement>(null);

  const viewportWidth = width ?? 0;
  const viewportHeight = height ?? 0;

  // Fixed width at 70vw
  const cardWidth = viewportWidth * 0.7;
  const maxHeight = viewportHeight * 0.8;

  // Calculate aspect ratio based on viewport
  let aspectRatio = viewportWidth / viewportHeight;

  // Constrain aspect ratio with boundaries (9:16 portrait to 16:9 landscape)
  const minRatio = 9 / 18; // Tallest (portrait)
  const maxRatio = 16 / 9; // Widest (landscape)
  aspectRatio = Math.max(minRatio, Math.min(maxRatio, aspectRatio));

  // Calculate height based on width and aspect ratio
  let cardHeight = cardWidth / aspectRatio;

  // Constrain to max height
  if (cardHeight > maxHeight) {
    cardHeight = maxHeight;
  }

  const isVideo = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isVideoContent = pageData.media_type === 'video' || isVideo(pageData.media_path ?? '');
  const mediaPath = pageData.media_path ?? '';

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideoContent) return;

    if (!isCarouselActive) {
      v.pause();
      return;
    }

    const tryPlay = () => {
      void v.play().catch(() => {});
    };

    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      v.addEventListener('canplay', tryPlay, { once: true });
      return () => v.removeEventListener('canplay', tryPlay);
    }
  }, [isCarouselActive, isVideoContent, mediaPath]);

  const isMobile = (width ?? 0) < 768;
  const isTablet = (width ?? 0) >= 768 && (width ?? 0) <= 1280;

  const handleButtonClick = (
    buttonType: 'navigation' | 'link',
    url?: string,
    navigationPath?: string
  ) => {
    if (buttonType === 'link' && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (buttonType === 'navigation' && navigationPath) {
      const element = document.querySelector(navigationPath);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderButtons = () => {
    if (!pageData.show_buttons || pageData.buttons.length === 0) {
      return null;
    }

    return (
      <div style={styles.buttonContainer}>
        {pageData.buttons.map((button, index) => (
          <Button
            key={index}
            type={button.isPrimary ? 'primary' : 'default'}
            size={isMobile ? 'middle' : 'large'}
            onClick={() => handleButtonClick(button.buttonType, button.url, button.navigationPath)}
            disabled={button.disabled}
          >
            <span style={styles.buttonIcon}>{getIconComponent(button.icon)}</span>
            <span>{button.text}</span>
          </Button>
        ))}
      </div>
    );
  };

  const renderContentInfo = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: 'clamp(1rem, 4vw, 4rem)',
          width: '100%',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: isTablet ? 'clamp(2.4rem, 7.2vw, 6.4rem)' : 'clamp(2.4rem, 8vw, 6.4rem)',
            color: pageData.page_number === 1 ? 'white' : 'white',
            fontWeight: '900',
            fontFamily: 'Valorax',
            lineHeight: '1',
            opacity: pageData.page_number === 1 ? 0.25 : 0.25,
            // textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
            // WebkitTextStroke: `5px ${token.colorPrimary}`,
          }}
        >
          {pageData.page_number === 1 ? projectName : String(pageData.page_number).padStart(2, '0')}
        </span>
        <span
          style={{
            fontSize: isTablet ? 'clamp(1rem, 2.4vw, 2.4rem)' : 'clamp(1rem, 3.2vw, 2.4rem)',
            color: 'white',
            fontWeight: '900',
            fontFamily: 'Valorax',
          }}
        >
          {pageData.header}
        </span>
        <span
          style={{
            fontSize: isTablet
              ? 'clamp(0.525rem, 1.2vw, 1.2rem)'
              : 'clamp(0.525rem, 1.5vw, 1.2rem)',
            fontWeight: '500',
            width: '90%',
            color: 'rgba(255, 255, 255, 0.75)',
          }}
        >
          {pageData.message}
        </span>
        {renderButtons()}
      </div>
    );
  };

  return (
    <div style={styles.imageCard}>
      {isVideoContent ? (
        <div style={{ ...styles.videoWrapper, width: cardWidth, height: cardHeight }}>
          <video
            ref={videoRef}
            src={mediaPath}
            controls
            loop
            muted
            playsInline
            style={{ ...styles.video, width: '100%', height: '100%' }}
          >
            Your browser does not support the video tag.
          </video>
          {pageData.show_vignette && <div style={styles.vignetteOverlay} />}
          <div style={styles.contentOverlay}>{renderContentInfo()}</div>
        </div>
      ) : (
        <div style={{ ...styles.videoWrapper, width: cardWidth, height: cardHeight }}>
          <img
            src={pageData.media_path ?? ''}
            alt={pageData.header}
            loading="lazy"
            style={{ ...styles.image, width: '100%', height: '100%' }}
          />
          {pageData.show_vignette && <div style={styles.vignetteOverlay} />}
          <div style={styles.contentOverlay}>{renderContentInfo()}</div>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
