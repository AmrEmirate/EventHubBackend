import { Router } from 'express';
import { getMeController, updateMeController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Terapkan middleware otentikasi langsung ke setiap rute
// untuk menghindari error tipe data yang kompleks.

router.get('/me', authMiddleware, getMeController);
router.put('/me', authMiddleware, updateMeController);

export default router;