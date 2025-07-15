import nodemailer from 'nodemailer';

// Konfigurasi transporter Anda (gunakan Ethereal untuk testing)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, 
  auth: {
    user: 'joany.langworth60@ethereal.email', // Ganti dengan akun Ethereal Anda
    pass: 'v7mGbrxK8kK7mQW7sS',      // Ganti dengan password Ethereal Anda
  },
});

// Fungsi untuk mengirim email status transaksi
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
    console.error(`Gagal mengirim email ke ${to}:`, error);
  }
};

// Fungsi untuk mengirim email verifikasi
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `http://localhost:3000/auth/verify?token=${token}`;
  try {
    const info = await transporter.sendMail({
      from: '"EventHub Platform" <no-reply@eventhub.com>',
      to: email,
      subject: 'Verifikasi Akun EventHub Anda',
      html: `<p>Terima kasih telah mendaftar! Silakan klik link di bawah ini untuk memverifikasi email Anda:</p><p><a href="${verificationLink}">Verifikasi Email Saya</a></p><p>Link ini akan kedaluwarsa dalam 1 jam.</p>`,
    });
    console.log('Preview URL (Verification): %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(`Gagal mengirim email verifikasi ke ${email}:`, error);
    throw new Error("Gagal mengirim email verifikasi.");
  }
};

// [PENAMBAHAN] Fungsi baru untuk mengirim email reset password
export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Ganti 'localhost:3000' dengan URL frontend Anda yang sebenarnya di production
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