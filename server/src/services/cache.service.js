import crypto from 'crypto';
import { redis } from '../config/redis.js';

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours (86,400 seconds)

export const generateRoastCacheKey = ({ owner, repo, readmeMarkdown }) => {
  if (owner && repo) {
    return `roast:repo:${owner.toLowerCase()}/${repo.toLowerCase()}`;
  }

  if (readmeMarkdown) {
    const hash = crypto.createHash('sha256').update(readmeMarkdown.trim()).digest('hex');
    return `roast:hash:${hash}`;
  }

  throw new Error('Cannot generate cache key without repository link or README content');
};

export const getCachedRoast = async (key) => {
  if (!redis || !key) return null;
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    return typeof cached === 'string' ? JSON.parse(cached) : cached;
  } catch (error) {
    console.error('Redis Cache Get Error:', error.message);
    return null;
  }
};

export const setCachedRoast = async (key, roastData) => {
  if (!redis || !key) return false;
  try {
    await redis.set(key, JSON.stringify(roastData), { ex: CACHE_TTL_SECONDS });
    return true;
  } catch (error) {
    console.error('Redis Cache Set Error:', error.message);
    return false;
  }
};
