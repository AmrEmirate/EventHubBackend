import { Router } from 'express';
// [PENAMBAHAN] Impor controller changePasswordController
import { getMeController, updateMeController, changePasswordController } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/me', authMiddleware, getMeController);
router.put('/me', authMiddleware, updateMeController);

// [PENAMBAHAN] Rute baru untuk mengubah password
router.put('/me/change-password', authMiddleware, changePasswordController);

export default router;