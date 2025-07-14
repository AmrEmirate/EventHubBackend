import { Router } from 'express';
import { registerController, loginController } from './auth.controller';

const router = Router();

/**
 * @swagger
 * tags:
 * name: Auth
 * description: Endpoint untuk autentikasi pengguna
 */

/**
 * @swagger
 * /api/v1/auth/register:
 * post:
 * summary: Mendaftarkan pengguna baru
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - name
 * - password
 * - role
 * properties:
 * email:
 * type: string
 * format: email
 * description: Email pengguna
 * name:
 * type: string
 * description: Nama lengkap pengguna
 * password:
 * type: string
 * format: password
 * description: Password pengguna (minimal 6 karakter)
 * role:
 * type: string
 * enum: [CUSTOMER, ORGANIZER]
 * description: Peran pengguna
 * referralCode:
 * type: string
 * description: Kode referral opsional
 * responses:
 * 201:
 * description: Pengguna berhasil didaftarkan
 * 400:
 * description: Input tidak valid
 * 409:
 * description: Email sudah terdaftar
 */
router.post('/register', registerController);

/**
 * @swagger
 * /api/v1/auth/login:
 * post:
 * summary: Login pengguna
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * password:
 * type: string
 * format: password
 * responses:
 * 200:
 * description: Login berhasil, mengembalikan token JWT
 * 401:
 * description: Kredensial tidak valid
 */
router.post('/login', loginController);

export default router;