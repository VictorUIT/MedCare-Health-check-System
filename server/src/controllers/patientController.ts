import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { getPatientProfile } from '../services/patientService';

// Xác thực phiên đăng nhập (Authentication Check)
export const getMyPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    // Gọi Service lấy dữ liệu (getPatientProfile)
    const patient = await getPatientProfile(req.user.id);

    // Kiểm tra sự tồn tại của dữ liệu (Data Validation)
    if (!patient) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bệnh nhân' });
    }

    // Trả về kết quả thành công (Success Response)
    return res.json({ patient });
    // Xử lý ngoại lệ (Error Handling)
  } catch (error: any) {
    console.error('Get Patient Profile Error:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin bệnh nhân', error: error.message });
  }
};
