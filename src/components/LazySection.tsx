import { useRef, useState, useEffect, type ReactNode } from 'react';
import { theme as antTheme } from 'antd';

interface Props {
  children: ReactNode;
  height?: string;
}

const LazySection = ({ children, height = '100vh' }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const { token } = antTheme.useToken();

  useEffect(() => {
    const el = ref.current;
    if (!el || hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasBeenVisible]);

  return (
    <div
      ref={ref}
      style={{ minHeight: hasBeenVisible ? undefined : height, backgroundColor: token.colorBgBase }}
    >
      {hasBeenVisible ? children : null}
    </div>
  );
};

export default LazySection;
