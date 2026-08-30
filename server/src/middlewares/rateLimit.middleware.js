import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../config/redis.js';

const TOTAL_ROAST_LIMIT = 67;
let ratelimit = null;

if (redis) {
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(TOTAL_ROAST_LIMIT, '24 h'),
    analytics: true,
    prefix: 'jaas:ratelimit',
  });
}

export const judgeRateLimiter = async (req, res, next) => {
  if (!ratelimit) {
    req.rateLimit = {
      limit: TOTAL_ROAST_LIMIT,
      used: 0,
      remaining: TOTAL_ROAST_LIMIT,
      usageFormatted: `0/${TOTAL_ROAST_LIMIT} roasts used this 24 hr`,
      remainingFormatted: `${TOTAL_ROAST_LIMIT}/${TOTAL_ROAST_LIMIT} roasts remaining`,
      resetAt: null,
    };
    return next();
  }

  try {
    const identifier =
      req.user?._id?.toString() ||
      req.user?.id ||
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.ip ||
      'anonymous';

    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    const resetDate = new Date(reset);
    const resetAt = resetDate.toISOString();
    const used = limit - remaining;

    const rateLimitData = {
      limit,
      used,
      remaining,
      usageFormatted: `${used}/${limit} roasts used this 24 hr`,
      remainingFormatted: `${remaining}/${limit} roasts remaining`,
      resetAt,
      resetMessage: `Limits will reset on next day at ${resetAt}`,
    };

    req.rateLimit = rateLimitData;

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());

    if (!success) {
      const resetInSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. You have used ${limit}/${limit} roasts allowed this 24 hr. Limits reset at ${resetAt}.`,
        rateLimit: {
          ...rateLimitData,
          used: limit,
          remaining: 0,
          usageFormatted: `${limit}/${limit} roasts used this 24 hr`,
          remainingFormatted: `0/${limit} roasts remaining`,
          resetInSeconds,
        },
      });
    }

    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error.message);
    req.rateLimit = {
      limit: TOTAL_ROAST_LIMIT,
      used: 0,
      remaining: TOTAL_ROAST_LIMIT,
      usageFormatted: `0/${TOTAL_ROAST_LIMIT} roasts used this 24 hr`,
      remainingFormatted: `${TOTAL_ROAST_LIMIT}/${TOTAL_ROAST_LIMIT} roasts remaining`,
      resetAt: null,
    };
    next();
  }
};
