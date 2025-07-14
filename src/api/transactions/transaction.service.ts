import prisma from '../../config/prisma';
import { sendTransactionStatusEmail } from '../../utils/mailer';
import { Prisma } from '@prisma/client';

/**
 * Membuat transaksi baru, dengan logika untuk voucher dan poin.
 */
export const createTransaction = async (
  userId: string,
  eventId: string,
  quantity: number,
  voucherCode?: string,
  usePoints?: boolean
) => {
  // Perhatikan penambahan tipe data 'Prisma.TransactionClient' di sini
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Event tidak ditemukan');

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User tidak ditemukan');

    if (event.ticketTotal - event.ticketSold < quantity) {
      throw new Error('Tiket tidak cukup');
    }

    let totalPrice = event.price * quantity;
    let finalPrice = totalPrice;
    let pointsUsed = 0;

    // Logika penggunaan voucher
    if (voucherCode) {
      const voucher = await tx.voucher.findFirst({
        where: { code: voucherCode, userId: userId, expiresAt: { gte: new Date() } },
      });
      if (!voucher) throw new Error('Voucher tidak valid atau sudah kedaluwarsa.');

      const discountFromVoucher = (totalPrice * voucher.discountPercent) / 100;
      const discountedAmount = voucher.maxDiscount && discountFromVoucher > voucher.maxDiscount ? voucher.maxDiscount : discountFromVoucher;
      finalPrice -= discountedAmount;
    }

    // Logika penggunaan poin
    if (usePoints) {
      const pointsAsCurrency = user.points;
      pointsUsed = Math.min(finalPrice, pointsAsCurrency);
      finalPrice -= pointsUsed;

      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: pointsUsed } },
      });
    }
    
    const paymentDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const transaction = await tx.transaction.create({
      data: {
        userId,
        eventId,
        quantity,
        totalPrice,
        finalPrice,
        paymentDeadline,
        voucherId: voucherCode ? (await tx.voucher.findUnique({ where: { code: voucherCode } }))?.id : undefined,
      },
    });

    await tx.event.update({
      where: { id: eventId },
      data: { ticketSold: { increment: quantity } },
    });

    return transaction;
  });
};

/**
 * User mengupload bukti bayar untuk transaksi mereka.
 */
export const uploadPaymentProof = async (userId: string, transactionId: string, filePath: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: userId }
  });
  if (!transaction) throw new Error("Transaksi tidak ditemukan.");

  return prisma.transaction.update({
    where: { id: transactionId },
    data: { 
      paymentProofUrl: filePath,
      status: 'PENDING_CONFIRMATION'
    },
  });
};

/**
 * User melihat riwayat transaksi mereka sendiri.
 */
export const getTransactionsByUserId = async (userId: string) => {
  return prisma.transaction.findMany({
    where: { userId: userId },
    include: {
      event: { select: { name: true, slug: true, startDate: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Organizer melihat semua transaksi dari event yang mereka selenggarakan.
 */
export const getTransactionsForOrganizer = async (organizerId: string) => {
  return prisma.transaction.findMany({
    where: { event: { organizerId: organizerId } },
    include: { event: { select: { name: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Organizer menyetujui sebuah transaksi.
 */
export const approveTransaction = async (organizerId: string, transactionId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, event: { organizerId: organizerId } },
    include: { user: { select: { email: true } } }
  });
  if (!transaction) throw new Error("Transaksi tidak ditemukan atau Anda tidak punya akses.");

  await sendTransactionStatusEmail(
    transaction.user.email,
    'Pembayaran Dikonfirmasi',
    `Pembayaran Anda untuk transaksi #${transaction.id} telah berhasil dikonfirmasi.`
  );
  
  return prisma.transaction.update({
    where: { id: transactionId },
    data: { status: 'COMPLETED' },
  });
};

/**
 * Organizer menolak sebuah transaksi.
 */
export const rejectTransaction = async (organizerId: string, transactionId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, event: { organizerId: organizerId } },
    include: { user: { select: { email: true } } }
  });
  if (!transaction) throw new Error("Transaksi tidak ditemukan atau Anda tidak punya akses.");
  
  await sendTransactionStatusEmail(
    transaction.user.email,
    'Pembayaran Ditolak',
    `Mohon maaf, pembayaran Anda untuk transaksi #${transaction.id} ditolak. Silakan hubungi penyelenggara.`
  );

  return prisma.$transaction([
    prisma.event.update({
      where: { id: transaction.eventId },
      data: { ticketSold: { decrement: transaction.quantity } }
    }),
    prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'REJECTED' }
    })
  ]);
};

/**
 * Pengguna membatalkan transaksi mereka sendiri.
 * Hanya bisa dilakukan jika status masih PENDING_PAYMENT.
 */
export const cancelTransaction = async (userId: string, transactionId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId: userId,
    },
  });

  if (!transaction) {
    throw new Error('Transaksi tidak ditemukan atau Anda tidak punya akses.');
  }

  if (transaction.status !== 'PENDING_PAYMENT') {
    throw new Error('Hanya transaksi yang menunggu pembayaran yang bisa dibatalkan.');
  }

  return prisma.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: transaction.eventId },
      data: { ticketSold: { decrement: transaction.quantity } },
    });

    const cancelledTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: 'CANCELLED' },
    });

    return cancelledTransaction;
  });
};