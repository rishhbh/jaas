import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../config/redis.js';

const AUTH_ROAST_LIMIT = 67;
const GUEST_ROAST_LIMIT = 1;

let authRatelimit = null;
let guestRatelimit = null;

if (redis) {
  authRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(AUTH_ROAST_LIMIT, '24 h'),
    analytics: true,
    prefix: 'jaas:ratelimit:auth',
  });

  guestRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(GUEST_ROAST_LIMIT, '24 h'),
    analytics: true,
    prefix: 'jaas:ratelimit:guest',
  });
}

export const judgeRateLimiter = async (req, res, next) => {
  const isAuth = !!req.user;
  const currentLimit = isAuth ? AUTH_ROAST_LIMIT : GUEST_ROAST_LIMIT;
  const limiter = isAuth ? authRatelimit : guestRatelimit;

  if (!limiter) {
    req.rateLimit = {
      limit: currentLimit,
      used: 0,
      remaining: currentLimit,
      usageFormatted: `0/${currentLimit} roasts used this 24 hr`,
      remainingFormatted: `${currentLimit}/${currentLimit} roasts remaining`,
      resetAt: null,
      isGuest: !isAuth,
    };
    return next();
  }

  try {
    const identifier = isAuth
      ? req.user._id?.toString() || req.user.id
      : `guest:${req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'anonymous'}`;

    if (req.method === 'GET') {
      let remaining = currentLimit;
      let resetAt = null;

      if (typeof limiter.getRemaining === 'function') {
        try {
          const remainingRes = await limiter.getRemaining(identifier);
          remaining = remainingRes.remaining;
          resetAt = new Date(remainingRes.reset).toISOString();
        } catch {
          remaining = currentLimit;
        }
      }

      const used = Math.max(0, currentLimit - remaining);
      req.rateLimit = {
        limit: currentLimit,
        used,
        remaining,
        usageFormatted: `${used}/${currentLimit} roasts used this 24 hr`,
        remainingFormatted: `${remaining}/${currentLimit} roasts remaining`,
        resetAt,
        resetMessage: resetAt ? `Limits reset at ${resetAt}` : 'Limits reset daily',
        isGuest: !isAuth,
      };
      return next();
    }

    const { success, limit, remaining, reset } = await limiter.limit(identifier);
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
      isGuest: !isAuth,
    };

    req.rateLimit = rateLimitData;

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());

    if (!success) {
      const resetInSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      const message = !isAuth
        ? `Guest users are limited to 1 roast generation per 24 hours. Sign in with Google to unlock 67 roasts per 24 hr!`
        : `Rate limit exceeded. You have used ${limit}/${limit} roasts allowed this 24 hr. Limits reset at ${resetAt}.`;

      return res.status(429).json({
        success: false,
        message,
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
      limit: currentLimit,
      used: 0,
      remaining: currentLimit,
      usageFormatted: `0/${currentLimit} roasts used this 24 hr`,
      remainingFormatted: `${currentLimit}/${currentLimit} roasts remaining`,
      resetAt: null,
      isGuest: !isAuth,
    };
    next();
  }
};
