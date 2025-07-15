import nodemailer from 'nodemailer';

// Konfigurasi transporter yang mengambil data dari file .env
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_PORT === '465', // true jika port 465, selain itu false
  auth: {
    user: process.env.MAIL_USER, // Ambil dari .env
    pass: process.env.MAIL_PASS, // Ambil dari .env
  },
});

/**
 * Mengirim email terkait status transaksi.
 */
export const sendTransactionStatusEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"EventHub Platform" <no-reply@eventhub.com>',
      to: to,
      subject: subject,
      html: `<b>${text}</b>`,
    });
    console.log('Preview URL (Transaction Status): %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Gagal mengirim email status transaksi ke ${to}:`, error);
  }
};

/**
 * Mengirim email verifikasi akun kepada pengguna baru.
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `http://localhost:3000/auth/verify?token=${token}`;
  try {
    const info = await transporter.sendMail({
      from: '"EventHub Platform" <no-reply@eventhub.com>',
      to: email,
      subject: 'Verifikasi Akun EventHub Anda',
      html: `<p>Terima kasih telah mendaftar! Klik link di bawah untuk memverifikasi email Anda:</p><p><a href="${verificationLink}">Verifikasi Email Saya</a></p><p>Link ini akan kedaluwarsa dalam 1 jam.</p>`,
    });
    console.log('Preview URL (Verification): %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Gagal mengirim email verifikasi ke ${email}:`, error);
    throw new Error("Gagal mengirim email verifikasi.");
  }
};

/**
 * Mengirim email berisi link untuk mereset password.
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
  try {
    const info = await transporter.sendMail({
      from: '"EventHub Platform" <no-reply@eventhub.com>',
      to: email,
      subject: 'Reset Password Akun EventHub Anda',
      html: `<p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda.</p><p>Klik link di bawah ini untuk melanjutkan:</p><p><a href="${resetLink}">Reset Password</a></p><p>Link ini akan kedaluwarsa dalam 1 jam.</p><p>Jika Anda tidak merasa meminta ini, abaikan saja email ini.</p>`,
    });
    console.log('Preview URL (Password Reset): %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Gagal mengirim email reset password ke ${email}:`, error);
    throw new Error("Gagal mengirim email reset password.");
  }
};