import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { getPatientProfile } from '../services/patientService';

export const getMyPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const patient = await getPatientProfile(req.user.id);

    if (!patient) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bệnh nhân' });
    }

    return res.json({ patient });
  } catch (error: any) {
    console.error('Get Patient Profile Error:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin bệnh nhân', error: error.message });
  }
};
