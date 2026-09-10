import express from 'express';
import {
  getDoctorScheduleDetails,
  setDoctorSchedules,
  addScheduleBlock,
  deleteScheduleBlock,
  getAvailableSlots
} from '../controllers/scheduleController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { availableSlotsParamsSchema, dateQuerySchema, scheduleBlockParamsSchema, scheduleBlockSchema, setDoctorSchedulesSchema } from '../schemas';

// Tạo router cho các endpoint liên quan đến lịch trình của bác sĩ
const router = express.Router();

router.get('/doctor/:doctorId', authenticateToken, authorizeRoles('ADMIN'), validate(availableSlotsParamsSchema, 'params'), getDoctorScheduleDetails);
router.get('/available/:doctorId', validate(availableSlotsParamsSchema, 'params'), validate(dateQuerySchema, 'query'), getAvailableSlots);
router.post('/set-hours', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), validate(setDoctorSchedulesSchema), setDoctorSchedules);
router.post('/blocks', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), validate(scheduleBlockSchema), addScheduleBlock);
router.delete('/blocks/:id', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), validate(scheduleBlockParamsSchema, 'params'), deleteScheduleBlock);

export default router;
