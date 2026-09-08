import * as yup from 'yup';
import { doctorIdParamsSchema, idParamsSchema } from './commonSchemas';

const time = yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải có định dạng HH:mm').required('Giờ là bắt buộc');
const dayOfWeek = yup.mixed<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>().oneOf(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']).required('Thứ là bắt buộc');

export const setDoctorSchedulesSchema = yup.object({
  doctorId: yup.string().uuid('doctorId không hợp lệ').optional(),
  schedules: yup.array().of(yup.object({
    dayOfWeek,
    startTime: time,
    endTime: time,
    slotDurationMinutes: yup.number().integer().min(5).max(240).required(),
    isAvailable: yup.boolean().required()
  })).min(1, 'Cần ít nhất một lịch làm việc').required('Danh sách lịch là bắt buộc')
});

export const scheduleBlockSchema = yup.object({
  doctorId: yup.string().uuid('doctorId không hợp lệ').optional(),
  date: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD').required('Ngày là bắt buộc'),
  startTime: time,
  endTime: time,
  reason: yup.string().trim().max(500).optional()
});

export const availableSlotsParamsSchema = doctorIdParamsSchema;
export const scheduleBlockParamsSchema = idParamsSchema;
