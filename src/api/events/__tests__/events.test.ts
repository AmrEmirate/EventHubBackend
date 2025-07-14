import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express'; // <-- Tambahkan impor tipe di sini
import eventRoutes from '../events.routes';
import { errorMiddleware } from '../../../middlewares/error.middleware';

// Mock middleware otentikasi
jest.mock('../../../middlewares/auth.middleware', () => ({
  // Tambahkan tipe data pada parameter di sini
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    req.user = { 
      id: 'organizer-test-id', 
      role: 'ORGANIZER',
    };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/v1/events', eventRoutes);
app.use(errorMiddleware);

describe('Event Endpoints', () => {
  // ... (isi tes Anda sudah benar)
  describe('POST /api/v1/events', () => {
    it('Harus menolak pembuatan event jika data tidak lengkap', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({ name: 'Event Kurang Data' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('Harus berhasil membuat event baru dengan data yang valid', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({
          name: `Konser Amal Tahunan ${new Date().getFullYear()}`,
          description: 'Sebuah konser amal tahunan untuk membantu sesama yang membutuhkan di sekitar kita.',
          category: 'Musik',
          location: 'Jakarta Convention Center',
          startDate: '2025-12-01T19:00:00.000Z',
          endDate: '2025-12-01T23:00:00.000Z',
          price: 250000,
          isFree: false,
          ticketTotal: 1000
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.data.organizerId).toEqual('organizer-test-id');
    });
  });
});