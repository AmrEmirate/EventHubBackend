import prisma from '../../config/prisma';

/**
 * Mengambil statistik dasar untuk dasbor organizer.
 */
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

/**
 * Mengambil data analitik untuk grafik di dasbor.
 */
export const getAnalyticsData = async (organizerId: string) => {
  // 1. Data Pendapatan per Hari (revenuePerDay)
  const revenuePerDay = await prisma.$queryRaw<Array<{ date: string; total: number }>>`
    SELECT 
      TO_CHAR(T."createdAt"::DATE, 'YYYY-MM-DD') as date, 
      SUM(T."finalPrice")::float as total
    FROM "Transaction" AS T
    JOIN "Event" AS E ON T."eventId" = E.id
    WHERE E."organizerId" = ${organizerId} AND T.status = 'COMPLETED'
    GROUP BY DATE(T."createdAt")
    ORDER BY DATE(T."createdAt") ASC;
  `;

  // 2. Data Tiket Terjual per Event (ticketsPerEvent)
  const ticketsPerEvent = await prisma.event.findMany({
    where: { organizerId },
    select: {
      name: true,
      ticketSold: true,
    },
    orderBy: {
      ticketSold: 'desc',
    },
  });

  // Ganti nama field 'name' menjadi 'eventName' dan 'ticketSold' menjadi 'sold'
  const formattedTicketsPerEvent = ticketsPerEvent.map(event => ({
    eventName: event.name,
    sold: event.ticketSold,
  }));

  return {
    revenuePerDay,
    ticketsPerEvent: formattedTicketsPerEvent,
  };
};