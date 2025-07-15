import { Router } from 'express';
// Import the new controller
import { getStatsController, getAnalyticsController, getOrganizerDashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// [NEW] Route to get all dashboard data at once
router.get('/', authMiddleware, getOrganizerDashboardController);

router.get('/stats', authMiddleware, getStatsController);
router.get('/analytics', authMiddleware, getAnalyticsController);

export default router;