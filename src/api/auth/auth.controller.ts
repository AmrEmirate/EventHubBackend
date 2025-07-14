import { Request, Response } from 'express';
import { registerUser } from './auth.service';
import { comparePassword } from '../../utils/password.helper';
import { generateToken } from '../../utils/jwt.helper';
import prisma from '../../config/prisma';
import { z } from 'zod';

// Skema validasi untuk data registrasi menggunakan Zod
const registerSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit"}).regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, { message: "Format nomor telepon tidak valid" }).optional(), // <-- TAMBAHKAN INI
  role: z.enum(['CUSTOMER', 'ORGANIZER']),
  referralCode: z.string().optional()
});

export const registerController = async (req: Request, res: Response) => {
  try {
    // 1. Validasi input
    const validatedData = registerSchema.parse(req.body);

    // 2. Panggil service dengan data yang sudah bersih
    const newUser = await registerUser(validatedData);
    
    res.status(201).json({
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error: any) {
    // Tangani error validasi dari Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Input tidak valid", errors: error.flatten().fieldErrors });
    }
    
    // Tangani error duplikat email dari Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    // Tangani error umum lainnya
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Kredensial tidak valid' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      message: 'Login successful',
      token,
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};