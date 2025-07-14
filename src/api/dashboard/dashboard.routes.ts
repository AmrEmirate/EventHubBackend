import { Router } from 'express';
import { getStatsController, getAnalyticsController } from './dashboard.controller'; // <-- Impor controller baru
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint untuk statistik dasbor
router.get('/stats', authMiddleware, getStatsController);
// Endpoint untuk data grafik analitik
router.get('/analytics', authMiddleware, getAnalyticsController); // <-- TAMBAHKAN RUTE INI

export default router;