import express from 'express';
import { judgeReadme, fetchReadmePreview } from '../controllers/judge.controller.js';
import { judgeRateLimiter } from '../middlewares/rateLimit.middleware.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/fetch-readme', fetchReadmePreview);
router.post('/readme', protect, judgeRateLimiter, judgeReadme);

export default router;
