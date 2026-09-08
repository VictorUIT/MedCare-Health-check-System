import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/databaseService';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy mã xác thực (Token missing)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medcare_super_secret_jwt_key_2026') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { doctorProfile: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại hoặc đã bị xóa' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
    }
    next();
  };
};
