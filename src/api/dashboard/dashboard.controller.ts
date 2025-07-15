import { Request, Response } from 'express';
// Import the new service function
import { getOrganizerStats, getOrganizerAnalytics, getOrganizerDashboardData } from './dashboard.service';
import { UserRole } from '@prisma/client';

// [NEW] Controller for the combined dashboard data
export const getOrganizerDashboardController = async (req: Request, res: Response) => {
  if (req.user?.role !== UserRole.ORGANIZER) {
    return res.status(403).json({ message: 'Akses ditolak.' });
  }

  try {
    const dashboardData = await getOrganizerDashboardData(req.user!.id);
    res.status(200).json(dashboardData);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil data dashboard', error: error.message });
  }
};

export const getStatsController = async (req: Request, res: Response) => {
  // ... (existing code, no changes)
};

export const getAnalyticsController = async (req: Request, res: Response) => {
  // ... (existing code, no changes)
};