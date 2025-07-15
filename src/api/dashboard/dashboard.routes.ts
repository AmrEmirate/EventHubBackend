import { Router } from 'express';
import { getStatsController, getAnalyticsController } from './dashboard.controller'; // Impor controller baru
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authMiddleware, getStatsController);

// [BARU] Rute untuk data analitik
router.get('/analytics', authMiddleware, getAnalyticsController);

export default router;