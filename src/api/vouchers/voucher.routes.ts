import { Router } from 'express';
import { getMyVouchersController } from './voucher.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Terapkan middleware langsung ke rute
router.get('/me', authMiddleware, getMyVouchersController);

export default router;