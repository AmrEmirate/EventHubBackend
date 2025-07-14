import { Router } from 'express';
import { getStatsController } from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
router.get('/stats', authMiddleware, getStatsController);
export default router;