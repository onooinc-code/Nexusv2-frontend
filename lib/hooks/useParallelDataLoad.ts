/**
 * Hook for parallel data loading to prevent navigation freezing
 * Loads multiple data sources concurrently instead of sequentially
 */

import { useCallback } from 'react';

interface LoadDataOptions {
  timeoutMs?: number;
  fallbackOnError?: boolean;
}

export const useParallelDataLoad = () => {
  /**
   * Load multiple async operations in parallel
   * Returns results in the same order as inputs
   * Handles timeouts gracefully
   */
  const loadInParallel = useCallback(
    async <T,>(
      loaders: (() => Promise<T>)[],
      options: LoadDataOptions = {}
    ): Promise<(T | null)[]> => {
      const { timeoutMs = 5000, fallbackOnError = true } = options;

      // Wrap loaders with timeout
      const withTimeout = async (loader: () => Promise<T>, id: number): Promise<T | null> => {
        try {
          return await Promise.race([
            loader().catch((error) => {
              console.warn(`Loader ${id} failed:`, error);
              if (fallbackOnError) return null;
              throw error;
            }),
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error(`Loader ${id} timeout after ${timeoutMs}ms`)), timeoutMs)
            ),
          ]);
        } catch (error) {
          console.warn(`Loader ${id} error:`, error);
          if (fallbackOnError) {
            return null;
          }
          throw error;
        }
      };

      try {
        return await Promise.all(
          loaders.map((loader, idx) => withTimeout(loader, idx))
        );
      } catch (error) {
        console.error('Parallel loading failed:', error);
        return loaders.map(() => null);
      }
    },
    []
  );

  /**
   * Load data sequentially but show results progressively
   * Used for dependent data loads
   */
  const loadSequentialWithProgress = useCallback(
    async <T,>(
      loaders: (() => Promise<T>)[],
      onProgress?: (loaded: T, index: number) => void,
      options: LoadDataOptions = {}
    ): Promise<T[]> => {
      const { timeoutMs = 5000, fallbackOnError = true } = options;
      const results: T[] = [];

      for (let i = 0; i < loaders.length; i++) {
        try {
          const result = await Promise.race([
            loaders[i](),
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error(`Loader ${i} timeout`)), timeoutMs)
            ),
          ]);

          results.push(result);
          onProgress?.(result, i);
        } catch (error) {
          console.warn(`Sequential loader ${i} failed:`, error);
          if (!fallbackOnError) throw error;
          results.push(null as any);
        }
      }

      return results;
    },
    []
  );

  /**
   * Batch multiple operations with retry logic
   */
  const loadWithRetry = useCallback(
    async <T,>(
      loader: () => Promise<T>,
      maxRetries: number = 2,
      delayMs: number = 500,
      timeoutMs: number = 5000
    ): Promise<T | null> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await Promise.race([
            loader(),
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), timeoutMs)
            ),
          ]);
        } catch (error) {
          if (attempt === maxRetries) {
            console.error(`Load failed after ${maxRetries + 1} attempts:`, error);
            return null;
          }
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs * Math.pow(2, attempt))
          );
        }
      }
      return null;
    },
    []
  );

  return {
    loadInParallel,
    loadSequentialWithProgress,
    loadWithRetry,
  };
};
