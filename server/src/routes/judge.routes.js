import express from 'express';
import { judgeReadme } from '../controllers/judge.controller.js';
import { judgeRateLimiter } from '../middlewares/rateLimit.middleware.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/readme', protect, judgeRateLimiter, judgeReadme);

export default router;
