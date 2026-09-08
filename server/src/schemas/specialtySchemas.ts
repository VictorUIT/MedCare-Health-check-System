import * as yup from 'yup';
import { idParamsSchema } from './commonSchemas';

const specialtyFields = {
  name: yup.string().trim().min(2).max(100).required('Tên chuyên khoa là bắt buộc'),
  description: yup.string().trim().max(1000).optional(),
  icon: yup.string().trim().max(100).optional(),
  image: yup.string().url('URL hình ảnh không hợp lệ').optional()
};

export const specialtySchema = yup.object(specialtyFields);
export const updateSpecialtySchema = yup.object({
  ...specialtyFields,
  name: specialtyFields.name.optional()
});

export const specialtyParamsSchema = idParamsSchema;
