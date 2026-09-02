/**
 * Simple in-memory rate limiter for profile image uploads.
 * 5 uploads per hour per user.
 */

const uploadRecords = new Map<string, { count: number; resetTime: number }>();

const UPLOAD_LIMIT = 5;
const UPLOAD_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkUploadRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = uploadRecords.get(userId);

  if (!record || now > record.resetTime) {
    uploadRecords.set(userId, { count: 1, resetTime: now + UPLOAD_WINDOW_MS });
    return { allowed: true, remaining: UPLOAD_LIMIT - 1, resetAt: now + UPLOAD_WINDOW_MS };
  }

  if (record.count >= UPLOAD_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: UPLOAD_LIMIT - record.count, resetAt: record.resetTime };
}
