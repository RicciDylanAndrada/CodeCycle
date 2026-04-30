import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (lazy - only if env vars are set)
const getRedis = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
};

// Rate limiters for different use cases
const createLimiter = (requests: number, window: string, prefix: string) => {
  const redis = getRedis();
  if (!redis) return null;  // <-- now the limiter itself is null when Redis is missing
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as any),
    analytics: true,
    prefix,
  });
};

export const rateLimiters = {
  auth:     createLimiter(5,  "1 m", "ratelimit:auth"),
  leetcode: createLimiter(10, "1 m", "ratelimit:leetcode"),
  general:  createLimiter(30, "1 m", "ratelimit:general"),
  review:   createLimiter(20, "1 m", "ratelimit:review"),
};


// Helper to get client IP from request
export const getClientIP = (request: Request): string => {
  // Check various headers for IP (works behind proxies/CDNs)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback - in production this should be set by your hosting platform
  return "anonymous";
};

// Helper to check rate limit and return error response if exceeded
type RateLimitResult = {
  success: boolean;
  headers: Record<string, string>;
  limit?: number;
  reset?: number;
  remaining?: number;
};

export const checkRateLimit = async (
  request: Request,
  limiter: keyof typeof rateLimiters
): Promise<RateLimitResult> => {
  const ip = getClientIP(request);
  const rateLimiter = rateLimiters[limiter];

  // If Redis is not configured, skip rate limiting (dev mode)
  if (!rateLimiter) {
    return { success: true, headers: {} };
  }

  const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  };
};
