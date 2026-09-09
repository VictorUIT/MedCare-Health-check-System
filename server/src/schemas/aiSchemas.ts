import * as yup from 'yup';

// Định nghĩa schema để validate dữ liệu đầu vào cho endpoint gợi ý chuyên khoa dựa trên triệu chứng
export const suggestSpecialtySchema = yup.object({
  symptoms: yup.string().trim().min(2, 'Vui lòng mô tả triệu chứng').max(5000).required('Triệu chứng là bắt buộc')
});
