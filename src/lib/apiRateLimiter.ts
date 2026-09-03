/**
 * In-memory sliding-window rate limiter for mutating API routes
 * (favorites, watch progress, comments, chat). Curbs abuse and accidental
 * request storms (e.g. the client firing dozens of sequential POSTs).
 *
 * Per-process only — suitable for a single Node instance. For multi-instance
 * deployment replace with a shared store (Redis) or enforce upstream (edge).
 */

type Bucket = { count: number; resetTime: number };

const buckets = new Map<string, Bucket>();

/** Prune expired buckets so the map cannot grow unbounded. */
let lastSweep = 0;
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (now > b.resetTime) buckets.delete(key);
  }
}

export function checkMutatingRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  sweep(now);
  const record = buckets.get(key);

  if (!record || now > record.resetTime) {
    buckets.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetTime };
}