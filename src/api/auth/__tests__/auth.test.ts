import request from 'supertest';
import express from 'express';
import authRoutes from '../auth.routes'; // Impor rute yang ingin kita tes

// Buat aplikasi Express mini khusus untuk testing
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

// Deskripsikan grup tes untuk Autentikasi
describe('Auth Endpoints', () => {
  // Gunakan email yang unik untuk setiap kali tes dijalankan
  const testEmail = `testuser_${Date.now()}@example.com`;

  // Skenario 1: Registrasi Pengguna
  describe('POST /api/v1/auth/register', () => {
    
    it('Harus menolak registrasi dengan data tidak valid (error Zod)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'bukan-email',
          name: 'ab',
          password: '123',
          role: 'CUSTOMER'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('Harus berhasil mendaftarkan pengguna baru dengan data yang valid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          name: 'Test User',
          password: 'password123',
          role: 'CUSTOMER'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('email', testEmail);
    });

    it('Harus menolak registrasi dengan email yang sudah ada', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail, // Gunakan email yang sama dari tes sebelumnya
          name: 'Another User',
          password: 'password456',
          role: 'ORGANIZER'
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'Email sudah terdaftar.');
    });
  });

  // Skenario 2: Login Pengguna
  describe('POST /api/v1/auth/login', () => {

    it('Harus menolak login dengan password yang salah', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'password-salah'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Kredensial tidak valid');
    });

    it('Harus berhasil login dengan kredensial yang benar dan mengembalikan token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'password123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});