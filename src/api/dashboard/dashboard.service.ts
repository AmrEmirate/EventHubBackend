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