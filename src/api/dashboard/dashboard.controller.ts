import { Request, Response } from 'express';
import { getOrganizerStats, getAnalyticsData } from './dashboard.service';
import { UserRole } from '@prisma/client';

export const getStatsController = async (req: Request, res: Response) => {
  if (req.user?.role !== UserRole.ORGANIZER) {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }

  try {
    const stats = await getOrganizerStats(req.user!.id);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil statistik', error: error.message });
  }
};

export const getAnalyticsController = async (req: Request, res: Response) => {
  if (req.user?.role !== UserRole.ORGANIZER) {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }

  try {
    const analyticsData = await getAnalyticsData(req.user!.id);
    res.status(200).json(analyticsData);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil data analitik', error: error.message });
  }
};