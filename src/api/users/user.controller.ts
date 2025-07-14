import { Request, Response } from 'express';
import { getUserProfile, updateUserProfile } from './user.service';
import { z } from 'zod';

// Skema validasi untuk memperbarui profil (semua field opsional)
const updateProfileSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url({ message: "URL avatar tidak valid" }).optional()
});

// Controller untuk mendapatkan profil 'saya' (logged-in user)
export const getMeController = async (req: Request, res: Response) => {
  try {
    const userProfile = await getUserProfile(req.user!.id);
    if (!userProfile) {
      return res.status(404).json({ message: 'Profil tidak ditemukan' });
    }
    res.status(200).json(userProfile);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil profil', error: error.message });
  }
};

// Controller untuk memperbarui profil 'saya'
export const updateMeController = async (req: Request, res: Response) => {
  try {
    // 1. Validasi input dari req.body
    const validatedData = updateProfileSchema.parse(req.body);

    // 2. Panggil service dengan data yang sudah bersih
    const updatedProfile = await updateUserProfile(req.user!.id, validatedData);
    res.status(200).json({ message: 'Profil berhasil diperbarui', data: updatedProfile });
  } catch (error: any) {
    // Tangani error validasi dari Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Input tidak valid", errors: error.flatten().fieldErrors });
    }
    // Tangani error lainnya
    res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
  }
};