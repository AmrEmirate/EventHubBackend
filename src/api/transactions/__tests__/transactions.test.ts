import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express'; // <-- Tambahkan impor tipe di sini
import transactionRoutes from '../transaction.routes';
import { errorMiddleware } from '../../../middlewares/error.middleware';

// Mock middleware otentikasi
jest.mock('../../../middlewares/auth.middleware', () => ({
  // Tambahkan tipe data pada parameter di sini
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    req.user = { 
      id: 'customer-test-id', 
      role: 'CUSTOMER',
      points: 50000 
    };
    next();
  },
}));

// Mock service
jest.mock('../transaction.service', () => ({
  createTransaction: jest.fn().mockImplementation((userId, eventId) => {
    if (eventId === 'event-tidak-ada') {
      throw new Error('Event tidak ditemukan');
    }
    return Promise.resolve({
      id: 'new-transaction-id',
      userId: userId,
      eventId: eventId,
      quantity: 2,
      status: 'PENDING_PAYMENT',
    });
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/transactions', transactionRoutes);
app.use(errorMiddleware);

describe('Transaction Endpoints', () => {
  // ... (isi tes Anda sudah benar)
  describe('POST /api/v1/transactions', () => {
    it('Harus berhasil membuat transaksi baru dengan data yang valid', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .send({ eventId: 'event-valid-id', quantity: 2 });
      expect(res.statusCode).toEqual(201);
      expect(res.body.userId).toEqual('customer-test-id');
    });

    it('Harus mengembalikan error jika service melempar error', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .send({ eventId: 'event-tidak-ada', quantity: 1 });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Event tidak ditemukan');
    });
  });
});