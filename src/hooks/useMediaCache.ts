import { useEffect, useRef, useState } from 'react';
import { getCachedMedia } from '../lib/mediaCache';

/**
 * Resolves a media URL through the IndexedDB blob cache.
 *
 * - On cache hit: returns a blob object URL instantly (no network).
 * - On cache miss: fetches the asset, caches the blob, returns object URL.
 * - On any failure: falls back to the raw `mediaPath` (direct Supabase URL).
 *
 * Automatically revokes stale object URLs on unmount / URL change to prevent
 * memory leaks.
 */
export function useMediaCache(
  mediaPath: string | null | undefined,
  updatedAt?: string
): { cachedUrl: string | null; isLoading: boolean } {
  // Single state atom — no synchronous setState in the effect body
  const [result, setResult] = useState<{ url: string | null; loading: boolean }>({
    url: null,
    loading: !!mediaPath,
  });

  // Track current object URL so we can revoke it when it changes or unmounts
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mediaPath) {
      return;
    }

    let cancelled = false;

    getCachedMedia(mediaPath, updatedAt).then(url => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }

      // Revoke previous object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = url;
      setResult({ url: url ?? mediaPath, loading: false });
    });

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [mediaPath, updatedAt]);

  // When inputs change, derive fresh initial state synchronously via lazy init
  const cachedUrl = !mediaPath ? null : result.url;
  const isLoading = !mediaPath ? false : result.loading;

  return { cachedUrl, isLoading };
}
