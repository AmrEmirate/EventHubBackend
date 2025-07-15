import crypto from 'crypto';

/**
 * Menghasilkan token acak yang aman dalam format hex.
 * Mengganti nama dari generateVerificationToken menjadi lebih umum.
 */
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};