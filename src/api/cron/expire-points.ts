import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export default async function handler(req: Request, res: Response) {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const result = await prisma.user.updateMany({
      where: {
        createdAt: { lt: threeMonthsAgo },
        points: { gt: 0 },
      },
      data: {
        points: 0,
      },
    });

    res.status(200).json({ message: `Proses selesai: ${result.count} pengguna poinnya di-reset.` });
  } catch (error: any) {
    res.status(500).json({ message: 'Cron job poin kedaluwarsa gagal', error: error.message });
  }
}