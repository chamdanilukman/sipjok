import { api } from './api';

/**
 * Helper functions for common API patterns
 */

/**
 * Fetch data with loading and error state management
 */
export async function fetchWithState<T>(
  fetchFn: () => Promise<T>,
  setData: (data: T) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<void> {
  setLoading(true);
  setError(null);
  
  try {
    const data = await fetchFn();
    setData(data);
  } catch (err: any) {
    setError(err.message || 'An error occurred');
    console.error('Fetch error:', err);
  } finally {
    setLoading(false);
  }
}

/**
 * Create a resource with optimistic UI update
 */
export async function createWithOptimistic<T>(
  createFn: () => Promise<T>,
  onSuccess: (data: T) => void,
  onError: (error: string) => void
): Promise<T | null> {
  try {
    const data = await createFn();
    onSuccess(data);
    return data;
  } catch (err: any) {
    onError(err.message || 'Failed to create resource');
    console.error('Create error:', err);
    return null;
  }
}

/**
 * Update a resource with optimistic UI update
 */
export async function updateWithOptimistic<T>(
  updateFn: () => Promise<T>,
  onSuccess: (data: T) => void,
  onError: (error: string) => void
): Promise<T | null> {
  try {
    const data = await updateFn();
    onSuccess(data);
    return data;
  } catch (err: any) {
    onError(err.message || 'Failed to update resource');
    console.error('Update error:', err);
    return null;
  }
}

/**
 * Delete a resource with confirmation
 */
export async function deleteWithConfirmation<T>(
  deleteFn: () => Promise<T>,
  onSuccess: () => void,
  onError: (error: string) => void,
  confirmMessage: string = 'Are you sure you want to delete this item?'
): Promise<boolean> {
  if (!window.confirm(confirmMessage)) {
    return false;
  }

  try {
    await deleteFn();
    onSuccess();
    return true;
  } catch (err: any) {
    onError(err.message || 'Failed to delete resource');
    console.error('Delete error:', err);
    return false;
  }
}

/**
 * Retry a failed request
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (err: any) {
      lastError = err;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Batch requests with concurrency limit
 */
export async function batchRequests<T, R>(
  items: T[],
  requestFn: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = [];
  const queue = [...items];

  async function processNext(): Promise<void> {
    const item = queue.shift();
    if (!item) return;

    try {
      const result = await requestFn(item);
      results.push(result);
    } catch (err) {
      console.error('Batch request error:', err);
    }

    if (queue.length > 0) {
      await processNext();
    }
  }

  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
}

/**
 * Debounced search function
 */
export function createDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delayMs: number = 300
): (query: string) => Promise<T[]> {
  let timeoutId: NodeJS.Timeout | null = null;

  return (query: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        try {
          const results = await searchFn(query);
          resolve(results);
        } catch (err) {
          reject(err);
        }
      }, delayMs);
    });
  };
}

/**
 * Cache API responses
 */
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.ttl),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const apiCache = new ApiCache();

/**
 * Fetch with cache
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchFn();
  apiCache.set(cacheKey, data, ttl);
  return data;
}
