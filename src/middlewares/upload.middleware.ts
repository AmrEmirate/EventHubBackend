import multer from 'multer';
import path from 'path';
import fs from 'fs'; // [PERBAIKAN] Impor modul 'fs' dari Node.js

// [PERBAIKAN] Tentukan direktori upload
const uploadDir = '/tmp/eventhub-uploads';

// Konfigurasi penyimpanan file yang lebih robust
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // [PERBAIKAN] Cek dan buat direktori jika belum ada
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari konflik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });