import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { getUserById, loginUser, registerUser, updateUserProfile } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, gender, address } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên' });
    }

    const { user, token } = await registerUser({ email, password, fullName, phone, dateOfBirth, gender, address });

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      user,
      token
    });
  } catch (error: any) {
    if (error.message === 'EMAIL_ALREADY_REGISTERED') {
      return res.status(400).json({ message: 'Email này đã được đăng ký trên hệ thống' });
    }
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Lỗi server khi đăng ký tài khoản', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const { user, token } = await loginUser(email, password);

    return res.json({
      message: 'Đăng nhập thành công',
      user,
      token
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng', error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const { fullName, phone, dateOfBirth, gender, address } = req.body;

    const userData = await updateUserProfile(req.user.id, { fullName, phone, dateOfBirth, gender, address });
    return res.json({
      message: 'Cập nhật thông tin cá nhân thành công',
      user: userData
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Lỗi server khi cập nhật hồ sơ', error: error.message });
  }
};
