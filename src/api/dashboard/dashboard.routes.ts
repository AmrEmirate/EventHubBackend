import { Router } from 'express';
import { getStatsController } from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint untuk statistik dasbor, memerlukan login sebagai organizer
router.get('/stats', authMiddleware, getStatsController);

export default router;