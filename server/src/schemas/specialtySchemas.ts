import * as yup from 'yup';
import { idParamsSchema } from './commonSchemas';

// Định nghĩa validation rules cho thông tin Chuyên khoa
const specialtyFields = {
  name: yup.string().trim().min(2).max(100).required('Tên chuyên khoa là bắt buộc'),
  description: yup.string().trim().max(1000).optional(),
  icon: yup.string().trim().max(100).optional(),
  image: yup.string().url('URL hình ảnh không hợp lệ').optional()
};

// Định nghĩa schema cho việc tạo Chuyên khoa
export const specialtySchema = yup.object(specialtyFields);
// Định nghĩa schema cho việc cập nhật thông tin Chuyên khoa
export const updateSpecialtySchema = yup.object({
  ...specialtyFields,
  name: specialtyFields.name.optional()
});

// Định nghĩa schema cho việc lấy thông tin Chuyên khoa theo ID
export const specialtyParamsSchema = idParamsSchema;
