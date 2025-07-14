import prisma from '../../config/prisma';

export const getVouchersByUserId = async (userId: string) => {
  const vouchers = await prisma.voucher.findMany({
    where: {
      userId: userId, // Cari voucher berdasarkan ID user
      expiresAt: {
        gte: new Date(), // Hanya tampilkan voucher yang belum kedaluwarsa
      },
    },
    orderBy: {
      expiresAt: 'asc', // Urutkan dari yang paling cepat kedaluwarsa
    },
  });
  return vouchers;
};