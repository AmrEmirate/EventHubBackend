import { Request, Response } from 'express';
import { registerUser } from './auth.service';
import { comparePassword } from '../../utils/password.helper';
import { generateToken } from '../../utils/jwt.helper';
import prisma from '../../config/prisma';

export const registerController = async (req: Request, res: Response) => {
  try {
    const newUser = await registerUser(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error: any) {
    // Handle error jika email sudah ada
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      message: 'Login successful',
      token,
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};