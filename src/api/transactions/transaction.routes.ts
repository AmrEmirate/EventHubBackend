import { Router } from 'express';
import * as controller from './transaction.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// --- Rute untuk Pengguna (Customer) ---
// Semua rute ini memerlukan login
router.post('/', authMiddleware, controller.createTransactionController);
router.get('/me', authMiddleware, controller.getMyTransactionsController);
router.post(
  '/:id/upload', 
  authMiddleware, 
  upload.single('paymentProof'), 
  controller.uploadPaymentProofController
);
// Menambahkan rute untuk membatalkan transaksi
router.post('/:id/cancel', authMiddleware, controller.cancelTransactionController);


// --- Rute untuk Penyelenggara (Organizer) ---
// Semua rute ini juga memerlukan login dan pengecekan peran di dalam controller
router.get('/organizer', authMiddleware, controller.getOrganizerTransactionsController);
router.post('/organizer/:id/approve', authMiddleware, controller.approveTransactionController);
router.post('/organizer/:id/reject', authMiddleware, controller.rejectTransactionController);

export default router;