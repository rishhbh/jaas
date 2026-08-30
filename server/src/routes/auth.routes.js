import express from 'express';
import { googleLogin, logoutUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', googleLogin);
router.post('/logout', logoutUser);

export default router;
