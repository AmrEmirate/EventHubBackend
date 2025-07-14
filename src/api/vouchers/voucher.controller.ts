import { Response } from 'express';
import { getVouchersByUserId } from './voucher.service';

export const getMyVouchersController = async (req: Request, res: Response) => {
  try {
    // Ambil user ID dari middleware otentikasi
    const vouchers = await getVouchersByUserId(req.user!.id);
    res.status(200).json(vouchers);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal mengambil data voucher', error: error.message });
  }
};