import { Router } from 'express';
import { createReviewController } from './review.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Endpoint untuk membuat ulasan baru, memerlukan login
router.post('/', authMiddleware, createReviewController);

export default router;