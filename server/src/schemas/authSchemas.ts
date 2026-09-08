import * as yup from 'yup';

const email = yup.string().trim().email('Email không hợp lệ').required('Email là bắt buộc');
const password = yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Mật khẩu là bắt buộc');

export const registerSchema = yup.object({
  email,
  password,
  fullName: yup.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').required('Họ tên là bắt buộc'),
  phone: yup.string().trim().optional(),
  dateOfBirth: yup.string().trim().optional(),
  gender: yup.string().trim().optional(),
  address: yup.string().trim().optional()
});

export const loginSchema = yup.object({ email, password });

export const updateProfileSchema = yup.object({
  fullName: yup.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').required('Họ tên là bắt buộc'),
  phone: yup.string().trim().optional(),
  dateOfBirth: yup.string().trim().optional(),
  gender: yup.string().trim().optional(),
  address: yup.string().trim().optional()
});
