import * as yup from 'yup';

// Định nghĩa schema cho việc lấy danh sách cuộc hẹn của bệnh nhân
export const idParamsSchema = yup.object({
  id: yup.string().uuid('ID không hợp lệ').required('ID là bắt buộc')
});

// Định nghĩa schema cho việc lấy danh sách cuộc hẹn của bác sĩ
export const doctorIdParamsSchema = yup.object({
  doctorId: yup.string().uuid('doctorId không hợp lệ').required('doctorId là bắt buộc')
});

// Định nghĩa schema cho việc lấy danh sách cuộc hẹn theo ngày
export const dateQuerySchema = yup.object({
  date: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD').required('Ngày là bắt buộc')
});
