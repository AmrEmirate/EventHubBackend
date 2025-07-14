import { Router } from 'express';
import { getMyVouchersController } from './voucher.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Daripada menggunakan router.use(authMiddleware),
// kita terapkan middleware langsung ke setiap rute yang membutuhkan
// untuk menghindari error tipe data yang kompleks.

router.get('/me', authMiddleware, getMyVouchersController);

export default router;