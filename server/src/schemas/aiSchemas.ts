import * as yup from 'yup';

export const suggestSpecialtySchema = yup.object({
  symptoms: yup.string().trim().min(2, 'Vui lòng mô tả triệu chứng').max(5000).required('Triệu chứng là bắt buộc')
});
