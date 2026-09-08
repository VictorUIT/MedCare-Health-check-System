import express from 'express';
import {
  setDoctorSchedules,
  addScheduleBlock,
  deleteScheduleBlock,
  getAvailableSlots
} from '../controllers/scheduleController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { availableSlotsParamsSchema, dateQuerySchema, scheduleBlockParamsSchema, scheduleBlockSchema, setDoctorSchedulesSchema } from '../schemas';

const router = express.Router();

router.get('/available/:doctorId', validate(availableSlotsParamsSchema, 'params'), validate(dateQuerySchema, 'query'), getAvailableSlots);
router.post('/set-hours', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), validate(setDoctorSchedulesSchema), setDoctorSchedules);
router.post('/blocks', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), validate(scheduleBlockSchema), addScheduleBlock);
router.delete('/blocks/:id', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), validate(scheduleBlockParamsSchema, 'params'), deleteScheduleBlock);

export default router;
