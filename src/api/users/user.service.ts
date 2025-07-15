import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
// [PENAMBAHAN] Impor helper untuk hash dan compare password
import { hashPassword, comparePassword } from '../../utils/password.helper';

// Mengambil profil user berdasarkan ID
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { // Pilih data yang ingin ditampilkan, jangan sertakan password
      id: true,
      email: true,
      name: true,
      role: true,
      points: true,
      referralCode: true,
      phone: true, // Pastikan phone juga diambil
      profile: true, // Sertakan data dari tabel Profile
    },
  });
  return user;
};

// Tipe data untuk input update
type UpdateProfileInput = {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
};

// Memperbarui profil user
export const updateUserProfile = async (userId: string, data: UpdateProfileInput) => {
  const { name, bio, avatarUrl, phone } = data;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name, // Update nama di tabel User
      phone: phone, // Update nomor telepon di tabel User
      profile: { // Update atau buat data di tabel Profile
        upsert: {
          create: { bio, avatarUrl }, // Buat jika belum ada
          update: { bio, avatarUrl }, // Update jika sudah ada
        },
      },
    },
    select: { // Pilih kembali data yang ingin ditampilkan
      id: true,
      email: true,
      name: true,
      phone: true,
      profile: true,
    },
  });
  return updatedUser;
};


// [PENAMBAHAN] Fungsi baru untuk mengubah password
export const changeUserPassword = async (
  userId: string,
  oldPass: string,
  newPass: string
) => {
  // 1. Ambil data user beserta password hash-nya
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User tidak ditemukan.');
  }

  // 2. Bandingkan password lama yang diinput dengan yang ada di database
  const isOldPasswordValid = await comparePassword(oldPass, user.password);
  if (!isOldPasswordValid) {
    throw new Error('Password lama tidak sesuai.');
  }

  // 3. Hash password baru
  const newHashedPassword = await hashPassword(newPass);

  // 4. Update password di database
  await prisma.user.update({
    where: { id: userId },
    data: { password: newHashedPassword },
  });

  return { message: 'Password berhasil diperbarui.' };
};