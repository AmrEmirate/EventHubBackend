import { Request, Response } from 'express';
import { createReview } from './review.service';

export const createReviewController = async (req: Request, res: Response) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user!.id;

    if (!eventId || !rating) {
      return res.status(400).json({ message: 'Event ID dan rating wajib diisi.' });
    }

    const review = await createReview(userId, eventId, rating, comment);
    res.status(201).json({ message: 'Ulasan berhasil dibuat', data: review });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};