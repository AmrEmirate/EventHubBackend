import prisma from '../../config/prisma';

export const getOrganizerStats = async (organizerId: string) => {
  const totalRevenue = await prisma.transaction.aggregate({
    _sum: { finalPrice: true },
    where: { event: { organizerId }, status: 'COMPLETED' },
  });

  const totalTicketsSold = await prisma.transaction.aggregate({
    _sum: { quantity: true },
    where: { event: { organizerId }, status: 'COMPLETED' },
  });

  const eventCount = await prisma.event.count({
    where: { organizerId },
  });

  return {
    revenue: totalRevenue._sum.finalPrice || 0,
    ticketsSold: totalTicketsSold._sum.quantity || 0,
    totalEvents: eventCount,
  };
};

// [BARU] Fungsi untuk mengambil data analitik
export const getOrganizerAnalytics = async (organizerId: string) => {
  // 1. Mengambil data pendapatan per hari (untuk 30 hari terakhir)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenuePerDay = await prisma.transaction.groupBy({
    by: ['createdAt'],
    where: {
      event: {
        organizerId: organizerId,
      },
      status: 'COMPLETED',
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    _sum: {
      finalPrice: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Format data agar sesuai dengan yang diharapkan frontend (Recharts)
  const formattedRevenue = revenuePerDay.map(item => ({
    date: item.createdAt.toISOString().split('T')[0], // Format ke YYYY-MM-DD
    total: item._sum.finalPrice || 0,
  }));

  // 2. Mengambil data tiket terjual per event
  const ticketsPerEvent = await prisma.event.findMany({
    where: {
      organizerId: organizerId,
      ticketSold: {
        gt: 0, // Hanya ambil event yang ada penjualan
      },
    },
    select: {
      name: true,
      ticketSold: true,
    },
    orderBy: {
      ticketSold: 'desc',
    },
    take: 10, // Ambil 10 event teratas
  });
  
  const formattedTickets = ticketsPerEvent.map(event => ({
    eventName: event.name,
    sold: event.ticketSold,
  }));

  return {
    revenuePerDay: formattedRevenue,
    ticketsPerEvent: formattedTickets,
  };
};