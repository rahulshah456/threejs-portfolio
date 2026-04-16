import Dexie, { type EntityTable } from 'dexie';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Max total cache size in MB. Oldest entries evicted when exceeded. */
export const MAX_CACHE_SIZE_MB = 500;
const MAX_CACHE_BYTES = MAX_CACHE_SIZE_MB * 1024 * 1024;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

interface MediaCacheEntry {
  /** Primary key – stable path extracted from URL + updatedAt suffix */
  cacheKey: string;
  blob: Blob;
  contentType: string;
  /** Blob size in bytes */
  size: number;
  /** Date.now() when entry was cached / last accessed */
  cachedAt: number;
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

const db = new Dexie('MediaCacheDB') as Dexie & {
  media: EntityTable<MediaCacheEntry, 'cacheKey'>;
};

db.version(1).stores({
  media: '&cacheKey, cachedAt, size',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract a stable cache key from a Supabase signed URL or relative path.
 *
 * Signed URL example:
 *   https://xxx.supabase.co/storage/v1/object/sign/assets/web3d/01.mp4?token=...
 *   → "assets/web3d/01.mp4"
 *
 * Relative path example:
 *   /assets/project/one/one-3.jpg → "assets/project/one/one-3.jpg"
 *
 * Appends `|{updatedAt}` when provided so content changes bust the cache.
 */
export function extractCacheKey(url: string, updatedAt?: string): string {
  let path: string;

  try {
    const parsed = new URL(url, 'https://placeholder.local');

    // Supabase signed URL: pathname contains /storage/v1/object/sign/{bucket/path}
    const signIdx = parsed.pathname.indexOf('/storage/v1/object/sign/');
    if (signIdx !== -1) {
      path = parsed.pathname.slice(signIdx + '/storage/v1/object/sign/'.length);
    } else {
      // Supabase public URL: /storage/v1/object/public/{bucket/path}
      const pubIdx = parsed.pathname.indexOf('/storage/v1/object/public/');
      if (pubIdx !== -1) {
        path = parsed.pathname.slice(pubIdx + '/storage/v1/object/public/'.length);
      } else {
        // Relative or unknown path – strip leading slash
        path = parsed.pathname.replace(/^\/+/, '');
      }
    }
  } catch {
    // Fallback for truly relative paths
    path = url.split('?')[0].replace(/^\/+/, '');
  }

  return updatedAt ? `${path}|${updatedAt}` : path;
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/** Sum of all cached blob sizes in bytes. */
export async function getTotalCacheSize(): Promise<number> {
  let total = 0;
  await db.media.each(entry => {
    total += entry.size;
  });
  return total;
}

/**
 * Evict oldest entries until at least `bytesNeeded` has been freed
 * (or cache is empty).
 */
export async function evictOldEntries(bytesNeeded: number): Promise<void> {
  let freed = 0;
  const oldest = await db.media.orderBy('cachedAt').toArray();

  for (const entry of oldest) {
    if (freed >= bytesNeeded) break;
    await db.media.delete(entry.cacheKey);
    freed += entry.size;
  }
}

/** Clear entire media cache. */
export async function clearCache(): Promise<void> {
  await db.media.clear();
}

/**
 * Retrieve media from IndexedDB cache or fetch + cache it.
 *
 * Returns a blob object URL on success, or `null` if caching fails
 * (caller should fall back to the original URL).
 */
export async function getCachedMedia(
  mediaPath: string,
  updatedAt?: string
): Promise<string | null> {
  const key = extractCacheKey(mediaPath, updatedAt);

  try {
    // --- Cache HIT ---
    const existing = await db.media.get(key);
    if (existing) {
      // Touch timestamp (LRU)
      void db.media.update(key, { cachedAt: Date.now() });
      return URL.createObjectURL(existing.blob);
    }

    // --- Cache MISS – fetch blob ---
    const res = await fetch(mediaPath, { mode: 'cors' });
    if (!res.ok) return null;

    const blob = await res.blob();
    const size = blob.size;
    const contentType = blob.type || res.headers.get('content-type') || 'application/octet-stream';

    // Skip caching if single blob exceeds entire cap
    if (size > MAX_CACHE_BYTES) {
      return URL.createObjectURL(blob);
    }

    // Ensure we have room
    const currentTotal = await getTotalCacheSize();
    if (currentTotal + size > MAX_CACHE_BYTES) {
      await evictOldEntries(currentTotal + size - MAX_CACHE_BYTES);
    }

    // Store
    try {
      await db.media.put({
        cacheKey: key,
        blob,
        contentType,
        size,
        cachedAt: Date.now(),
      });
    } catch (err: unknown) {
      // QuotaExceededError – evict and retry once
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        await evictOldEntries(size);
        try {
          await db.media.put({
            cacheKey: key,
            blob,
            contentType,
            size,
            cachedAt: Date.now(),
          });
        } catch {
          // Give up caching; still return the blob
        }
      }
    }

    return URL.createObjectURL(blob);
  } catch {
    // Network error / IndexedDB failure – caller falls back to direct URL
    return null;
  }
}
