import jwt from 'jsonwebtoken';

export const generateToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d', // Token berlaku selama 7 hari
  });
};