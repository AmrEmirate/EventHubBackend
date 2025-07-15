import { Request, Response } from 'express';
import { registerUser } from './auth.service';
import { comparePassword } from '../../utils/password.helper';
import { generateToken } from '../../utils/jwt.helper';
import prisma from '../../config/prisma';
import { z } from 'zod';

// registerSchema dan registerController tidak ada perubahan...
const registerSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit"}).regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, { message: "Format nomor telepon tidak valid" }).optional(),
  role: z.enum(['CUSTOMER', 'ORGANIZER']),
  referralCode: z.string().optional()
});

export const registerController = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const newUser = await registerUser(validatedData);
    res.status(201).json({
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Input tidak valid", errors: error.flatten().fieldErrors });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// [PERBAIKAN FINAL] loginController dengan 'select' yang sudah diperbaiki
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        points: true,
        referralCode: true,
        phone: true, // <-- [PERBAIKAN] 'phone' dipindahkan ke sini
        profile: {
          select: {
            bio: true,
            avatarUrl: true,
            // 'phone' dihapus dari sini
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    const { password: _, ...userToReturn } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userToReturn,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan internal pada server.', error: error.message });
  }
};