import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client'; // <-- PERBAIKAN DI SINI

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
};

// Memperbarui profil user
export const updateUserProfile = async (userId: string, data: UpdateProfileInput) => {
  const { name, bio, avatarUrl } = data;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name, // Update nama di tabel User
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
      profile: true,
    },
  });
  return updatedUser;
};