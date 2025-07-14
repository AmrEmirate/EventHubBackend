import multer from 'multer';
import path from 'path';

// Konfigurasi penyimpanan file untuk lingkungan serverless seperti Vercel
const storage = multer.diskStorage({
  // Simpan file sementara di direktori /tmp, satu-satunya lokasi yang bisa ditulis di Vercel
  destination: function (req, file, cb) {
    cb(null, '/tmp'); 
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik untuk menghindari konflik
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });