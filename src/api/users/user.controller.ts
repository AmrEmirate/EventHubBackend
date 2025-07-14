import { Request, Response } from 'express'; // <-- Pastikan ini ada
import { getUserProfile, updateUserProfile } from './user.service';

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
    const updatedProfile = await updateUserProfile(req.user!.id, req.body);
    res.status(200).json({ message: 'Profil berhasil diperbarui', data: updatedProfile });
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
  }
};