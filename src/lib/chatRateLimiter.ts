import { DB_ENABLED } from "@/lib/env";

const messageCountMap = new Map<string, { count: number; resetTime: number }>();

export function checkChatRateLimit(userId: string, limit = 5, windowMs = 60000): boolean {
  if (!DB_ENABLED) return true;

  const now = Date.now();
  const record = messageCountMap.get(userId);

  if (!record || now > record.resetTime) {
    messageCountMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export function getChatRateLimitStatus(userId: string): { remaining: number; resetAt: number } {
  const record = messageCountMap.get(userId);
  const now = Date.now();

  if (!record || now > record.resetTime) {
    return { remaining: 5, resetAt: now + 60000 };
  }

  return {
    remaining: Math.max(0, 5 - record.count),
    resetAt: record.resetTime,
  };
}

export function cleanupExpiredRateLimits() {
  const now = Date.now();
  for (const [userId, record] of messageCountMap.entries()) {
    if (now > record.resetTime + 60000) {
      messageCountMap.delete(userId);
    }
  }
}

setInterval(cleanupExpiredRateLimits, 60000);
