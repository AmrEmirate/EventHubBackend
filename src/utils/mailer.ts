import nodemailer from 'nodemailer';

// Konfigurasi ini menggunakan Ethereal untuk testing.
// Untuk production, ganti dengan kredensial SMTP Anda (cth: SendGrid, Mailgun)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'joany.langworth60@ethereal.email', // Ganti dengan akun Ethereal Anda
    pass: 'v7mGbrxK8kK7mQW7sS',      // Ganti dengan password Ethereal Anda
  },
});

export const sendTransactionStatusEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"EventHub Platform" <no-reply@eventhub.com>',
      to: to,
      subject: subject,
      text: text,
      html: `<b>${text}</b>`, // Bisa juga pakai HTML
    });
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Gagal mengirim email:', error);
  }
};