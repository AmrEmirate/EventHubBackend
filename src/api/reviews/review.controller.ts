import { Request, Response } from 'express';
import { createReview } from './review.service';
import { z } from 'zod';

// Skema validasi untuk membuat ulasan baru
const createReviewSchema = z.object({
  eventId: z.string().uuid({ message: "Event ID tidak valid" }),
  rating: z.number().int().min(1, { message: "Rating minimal adalah 1" }).max(5, { message: "Rating maksimal adalah 5" }),
  comment: z.string().optional()
});


export const createReviewController = async (req: Request, res: Response) => {
  try {
    // 1. Validasi input dari req.body
    const validatedData = createReviewSchema.parse(req.body);
    const userId = req.user!.id;

    // 2. Panggil service dengan data yang sudah bersih
    const review = await createReview(
      userId,
      validatedData.eventId,
      validatedData.rating,
      validatedData.comment
    );
    
    res.status(201).json({ message: 'Ulasan berhasil dibuat', data: review });
  } catch (error: any) {
    // Tangani error validasi dari Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Input tidak valid", errors: error.flatten().fieldErrors });
    }
    // Tangani error lain dari service (misal: user belum beli tiket)
    res.status(400).json({ message: error.message });
  }
};