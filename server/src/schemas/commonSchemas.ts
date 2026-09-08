import * as yup from 'yup';

export const idParamsSchema = yup.object({
  id: yup.string().uuid('ID không hợp lệ').required('ID là bắt buộc')
});

export const doctorIdParamsSchema = yup.object({
  doctorId: yup.string().uuid('doctorId không hợp lệ').required('doctorId là bắt buộc')
});

export const dateQuerySchema = yup.object({
  date: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD').required('Ngày là bắt buộc')
});
