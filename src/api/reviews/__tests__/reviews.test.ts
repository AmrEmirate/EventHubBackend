import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import reviewRoutes from '../review.routes';
import { errorMiddleware } from '../../../middlewares/error.middleware';

// Mock middleware otentikasi
jest.mock('../../../middlewares/auth.middleware', () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    req.user = { 
      id: 'customer-test-id', 
      role: 'CUSTOMER',
    };
    next();
  },
}));

// Mock service layer untuk mengontrol hasil dari database
jest.mock('../review.service', () => ({
  createReview: jest.fn().mockImplementation(async (userId, eventId, rating, comment) => {
    // Simulasikan kasus di mana pengguna belum pernah membeli tiket
    if (eventId === 'event-belum-dibeli') {
      throw new Error('Anda hanya bisa mengulas event yang pernah Anda hadiri.');
    }
    // Simulasikan kasus sukses
    return Promise.resolve({
      id: 'new-review-id',
      userId,
      eventId,
      rating,
      comment,
    });
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/reviews', reviewRoutes);
app.use(errorMiddleware);

describe('Review Endpoints', () => {

  describe('POST /api/v1/reviews', () => {

    it('Harus menolak pembuatan ulasan jika data tidak lengkap', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send({
          eventId: 'some-event-id'
          // Sengaja tidak menyertakan "rating" yang wajib
        });
      
      expect(res.statusCode).toEqual(400); // Mengharapkan error validasi Zod
      expect(res.body).toHaveProperty('errors');
    });

    it('Harus menolak ulasan jika pengguna belum pernah membeli tiket event tersebut', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send({
          eventId: 'event-belum-dibeli',
          rating: 5,
        });
        
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Anda hanya bisa mengulas event yang pernah Anda hadiri.');
    });

    it('Harus berhasil membuat ulasan baru dengan data yang valid', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send({
          eventId: 'event-valid-id',
          rating: 5,
          comment: 'Workshopnya sangat bermanfaat!'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('rating', 5);
      expect(res.body.data.comment).toBe('Workshopnya sangat bermanfaat!');
    });

  });
});