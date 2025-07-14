import { Router } from 'express';
import { createReviewController } from './review.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
router.post('/', authMiddleware, createReviewController);
export default router;