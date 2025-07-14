// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './api/auth/auth.routes';
import userRoutes from './api/users/user.routes';
import voucherRoutes from './api/vouchers/voucher.routes';
import eventRoutes from './api/events/events.routes';
import transactionRoutes from './api/transactions/transaction.routes';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Selamat datang di API Platform Manajemen Event!');
});

// Pendaftaran Semua Rute
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/events', eventRoutes); // <-- Diaktifkan kembali
app.use('/api/v1/transactions', transactionRoutes); 

app.listen(port, () => {
  console.log(`⚡️ [server]: Server berjalan di http://localhost:${port}`);
});