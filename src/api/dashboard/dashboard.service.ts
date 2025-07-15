import prisma from '../../config/prisma';

export const getOrganizerStats = async (organizerId: string) => {
  // ... (existing code, no changes here)
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

export const getOrganizerAnalytics = async (organizerId: string) => {
  // ... (existing code, no changes here)
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

  const formattedRevenue = revenuePerDay.map(item => ({
    date: item.createdAt.toISOString().split('T')[0],
    total: item._sum.finalPrice || 0,
  }));

  const ticketsPerEvent = await prisma.event.findMany({
    where: {
      organizerId: organizerId,
      ticketSold: {
        gt: 0,
      },
    },
    select: {
      name: true,
      ticketSold: true,
    },
    orderBy: {
      ticketSold: 'desc',
    },
    take: 10,
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

// [NEW] Add this new function to combine the data
export const getOrganizerDashboardData = async (organizerId: string) => {
  const stats = await getOrganizerStats(organizerId);
  const analytics = await getOrganizerAnalytics(organizerId);

  return {
    stats,
    analytics,
  };
};