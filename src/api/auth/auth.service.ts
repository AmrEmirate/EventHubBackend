import prisma from '../../config/prisma';
import { User, Prisma } from '@prisma/client';
import { hashPassword } from '../../utils/password.helper';

// Tipe data untuk input register, sudah ditambahkan 'phone'
type RegisterInput = Omit<User, 'id' | 'points' | 'referralCode' | 'createdAt' | 'updatedAt' | 'referredById' | 'phone'> & {
  referralCode?: string;
  phone?: string | null;
};

export const registerUser = async (data: RegisterInput) => {
  // Ambil 'phone' dari data
  const { email, name, password, role, referralCode, phone } = data;

  // Jika tidak ada referralCode, lakukan registrasi biasa
  if (!referralCode) {
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      // Tambahkan 'phone' ke data yang disimpan
      data: { email, name, password: hashedPassword, role, phone },
    });
    // Jangan kembalikan password di response
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // --- LOGIKA JIKA ADA REFERRALCODE ---

  // 1. Cari user pemilik referral code (si pengajak)
  const referrer = await prisma.user.findUnique({
    where: { referralCode: referralCode },
  });

  if (!referrer) {
    throw new Error('Kode referral tidak valid.');
  }

  // 2. Lakukan semua operasi database dalam satu transaksi
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 2a. Buat user baru (pendaftar) dengan 10.000 poin
    const hashedPassword = await hashPassword(password);
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        phone, // <-- Tambahkan 'phone' di sini
        points: 10000, // Langsung beri 10.000 poin
        referredById: referrer.id, // Catat siapa yang mereferensikan
      },
    });

    // 2b. Buat voucher hadiah untuk si pengajak (referrer)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3); // Voucher berlaku 3 bulan

    await tx.voucher.create({
      data: {
        code: `REF-${referrer.name.toUpperCase()}-${Date.now()}`, // Buat kode voucher unik
        discountPercent: 15, // Hadiah diskon 15%
        expiresAt: expiryDate,
        userId: referrer.id, // Berikan voucher ini ke si pengajak
      },
    });

    return newUser;
  });

  // Jangan kembalikan password di response
  const { password: _, ...userWithoutPassword } = result;
  return userWithoutPassword;
};