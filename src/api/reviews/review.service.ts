import prisma from '../../config/prisma';

export const createReview = async (userId: string, eventId: string, rating: number, comment?: string) => {
  // 1. Cek apakah user pernah membeli tiket event ini dan transaksinya selesai
  const completedTransaction = await prisma.transaction.findFirst({
    where: {
      userId,
      eventId,
      status: 'COMPLETED',
    },
  });

  if (!completedTransaction) {
    throw new Error('Anda hanya bisa mengulas event yang pernah Anda hadiri.');
  }

  // 2. Cek apakah user sudah pernah memberikan ulasan untuk event ini
  const existingReview = await prisma.review.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existingReview) {
    throw new Error('Anda sudah pernah memberikan ulasan untuk event ini.');
  }

  // 3. Buat ulasan baru
  return prisma.review.create({
    data: { userId, eventId, rating, comment },
  });
};