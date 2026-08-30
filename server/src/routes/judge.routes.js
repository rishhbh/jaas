import express from 'express';
import { judgeReadme, fetchReadmePreview, getRateLimitStatus } from '../controllers/judge.controller.js';
import { judgeRateLimiter } from '../middlewares/rateLimit.middleware.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/fetch-readme', fetchReadmePreview);
router.post('/readme', protect, judgeRateLimiter, judgeReadme);
router.get('/rate-limit', protect, judgeRateLimiter, getRateLimitStatus);

export default router;
