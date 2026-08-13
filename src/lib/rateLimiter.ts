/**
 * Robust Token-Bucket & Concurrency-Controlled Rate Limiter
 * Strictly prevents Jikan API 429 (Rate Limit) and 504 (Gateway Timeout) errors.
 */

export interface RateLimiterOptions {
  perSecond?: number;
  minIntervalMs?: number;
  maxConcurrency?: number;
}

export function createRateLimiter(opts: RateLimiterOptions = {}) {
  const minIntervalMs = opts.minIntervalMs ?? 360; // minimum ~360ms between request starts (~2.7 req/s)
  const maxConcurrency = opts.maxConcurrency ?? 2;

  let activeCount = 0;
  let lastRequestTime = 0;

  const queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    retries: number;
  }> = [];

  let isProcessing = false;

  async function processQueue() {
    if (isProcessing) return;
    isProcessing = true;

    while (queue.length > 0) {
      if (activeCount >= maxConcurrency) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        continue;
      }

      const now = Date.now();
      const timeSinceLast = now - lastRequestTime;
      if (timeSinceLast < minIntervalMs) {
        await new Promise((resolve) => setTimeout(resolve, minIntervalMs - timeSinceLast));
        continue;
      }

      const item = queue.shift();
      if (!item) break;

      lastRequestTime = Date.now();
      activeCount++;

      (async () => {
        try {
          const result = await item.fn();
          item.resolve(result);
        } catch (err: any) {
          const status = err?.status || err?.response?.status;
          const isRetryable = status === 429 || status === 504 || status === 503 || status === 502;

          if (isRetryable && item.retries < 2) {
            const delay = (item.retries + 1) * 800 + Math.floor(Math.random() * 300);
            await new Promise((resolve) => setTimeout(resolve, delay));
            queue.unshift({
              ...item,
              retries: item.retries + 1,
            });
          } else {
            item.reject(err);
          }
        } finally {
          activeCount--;
          // Trigger next in queue
          processQueue();
        }
      })();
    }

    isProcessing = false;
  }

  return {
    schedule<T>(fn: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        queue.push({
          fn,
          resolve,
          reject,
          retries: 0,
        });
        processQueue();
      });
    },
  };
}

// Global server-side singleton rate limiters
export const jikanRateLimiter = createRateLimiter({ minIntervalMs: 380, maxConcurrency: 2 });
export const anikotoRateLimiter = createRateLimiter({ minIntervalMs: 800, maxConcurrency: 1 });
export const anilistRateLimiter = createRateLimiter({ minIntervalMs: 650, maxConcurrency: 3 });

