import * as yup from 'yup';

// Định nghĩa schema cho việc tạo đánh giá
export const createReviewSchema = yup.object({
  appointmentId: yup.string().uuid('appointmentId không hợp lệ').required('appointmentId là bắt buộc'),
  rating: yup.number().integer().min(1).max(5).required('Số sao là bắt buộc'),
  comment: yup.string().trim().max(2000, 'Nhận xét không được vượt quá 2000 ký tự').optional()
});
