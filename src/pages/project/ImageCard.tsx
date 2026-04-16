import { useEffect, useRef } from 'react';
import { useMediaCache } from '../../hooks/useMediaCache';
import type { ProjectPageRecord } from '../../utils/interfaces';
import styles from './index.css.tsx';

interface Props {
  pageData: ProjectPageRecord;
  isCarouselActive?: boolean;
}

const ImageCard = ({ pageData, isCarouselActive = true }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isVideoContent = pageData.media_type === 'video' || isVideo(pageData.media_path ?? '');
  const mediaPath = pageData.media_path ?? '';

  // Resolve through IndexedDB blob cache (avoids repeated Supabase CDN hits)
  const { cachedUrl } = useMediaCache(mediaPath || null, pageData.updated_at);
  const resolvedUrl = cachedUrl ?? mediaPath;

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

  const getContent = () => {
    if (isVideoContent) {
      return (
        <video ref={videoRef} src={resolvedUrl} loop muted playsInline style={styles.video}>
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return <img src={resolvedUrl} alt={pageData.header} loading="lazy" style={styles.image} />;
    }
  };

  return (
    <div>
      <div style={styles.imageCard}>
        <div
          style={{
            ...styles.inactiveOverlay,
            opacity: isCarouselActive ? 0 : 1,
            pointerEvents: isCarouselActive ? 'none' : 'auto',
          }}
        />
        {getContent()}
        {/* {pageData.show_vignette && <div style={styles.vignetteOverlay} />} */}
        {/* <div style={styles.contentOverlay}>{renderContentInfo()}</div> */}
      </div>
    </div>
  );
};

export default ImageCard;
