import * as yup from 'yup';
import { idParamsSchema } from './commonSchemas';

const doctorFields = {
  fullName: yup.string().trim().min(2).required('Họ tên là bắt buộc'),
  phone: yup.string().trim().optional(),
  gender: yup.string().trim().optional(),
  specialtyId: yup.string().uuid('specialtyId không hợp lệ').required('Chuyên khoa là bắt buộc'),
  title: yup.string().trim().optional(),
  bio: yup.string().trim().max(3000).optional(),
  experienceYears: yup.number().integer().min(0).max(80).optional(),
  consultationFee: yup.number().min(0).optional(),
  hospitalAddress: yup.string().trim().max(500).optional()
};

export const createDoctorSchema = yup.object({
  email: yup.string().trim().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Mật khẩu là bắt buộc'),
  ...doctorFields
});

export const updateDoctorSchema = yup.object({
  ...doctorFields,
  specialtyId: yup.string().uuid('specialtyId không hợp lệ').optional()
});

export const doctorParamsSchema = idParamsSchema;
export const doctorQuerySchema = yup.object({
  specialtyId: yup.string().uuid('specialtyId không hợp lệ').optional(),
  search: yup.string().trim().max(100).optional(),
  minRating: yup.number().min(0).max(5).optional(),
  maxFee: yup.number().min(0).optional()
});
