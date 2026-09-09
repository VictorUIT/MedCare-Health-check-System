import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/databaseService';

// 1. Mở rộng TypeScript Request interface để bao gồm thông tin người dùng
export interface AuthRequest extends Request {
  user?: any;
}

// 2. Middleware xác thực JWT
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Lấy token từ header Authorization
  const authHeader = req.headers['authorization'];
  // Token thường có định dạng "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  // Nếu không có token, trả về lỗi 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy mã xác thực (Token missing)' });
  }

  try {
    // Giải mã token và lấy thông tin người dùng
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medcare_super_secret_jwt_key_2026') as { userId: string };
    // Tìm người dùng trong cơ sở dữ liệu dựa trên userId từ token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { doctorProfile: true }
    });

    // Nếu không tìm thấy người dùng, trả về lỗi 401 Unauthorized
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại hoặc đã bị xóa' });
    }

    // Gán thông tin người dùng vào req.user để các middleware hoặc route handler tiếp theo có thể sử dụng
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// 3. Middleware xác thực vai trò người dùng
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
    }
    next();
  };
};
