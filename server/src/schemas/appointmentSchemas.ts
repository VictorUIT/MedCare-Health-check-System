import * as yup from 'yup';
import { dateQuerySchema, doctorIdParamsSchema, idParamsSchema } from './commonSchemas';

const time = yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải có định dạng HH:mm').required('Giờ là bắt buộc');

export const createAppointmentSchema = yup.object({
  doctorId: yup.string().uuid('doctorId không hợp lệ').required('Bác sĩ là bắt buộc'),
  date: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD').required('Ngày khám là bắt buộc'),
  startTime: time,
  endTime: time,
  patientNotes: yup.string().trim().max(1000, 'Ghi chú không được vượt quá 1000 ký tự').optional()
});

export const appointmentIdParamsSchema = idParamsSchema;

export const updateAppointmentStatusSchema = yup.object({
  status: yup.mixed<'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>().oneOf(['CONFIRMED', 'COMPLETED', 'CANCELLED']).required('Trạng thái là bắt buộc'),
  doctorNotes: yup.string().trim().max(2000, 'Ghi chú không được vượt quá 2000 ký tự').optional()
});

export const cancelAppointmentSchema = yup.object({
  reason: yup.string().trim().max(500, 'Lý do không được vượt quá 500 ký tự').optional()
});

export const patientAppointmentsQuerySchema = yup.object({
  type: yup.mixed<'upcoming' | 'past'>().oneOf(['upcoming', 'past']).optional()
});

export const doctorAppointmentsQuerySchema = yup.object({
  date: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD').optional(),
  status: yup.string().oneOf(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional()
});

export const adminAppointmentsQuerySchema = yup.object({
  doctorId: yup.string().uuid('doctorId không hợp lệ').optional(),
  status: yup.string().oneOf(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  date: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD').optional(),
  search: yup.string().trim().max(100).optional()
});

export { dateQuerySchema, doctorIdParamsSchema };
