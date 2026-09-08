import express from 'express';
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAdminAppointments,
  updateAppointmentStatus,
  cancelAppointment
} from '../controllers/appointmentController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  adminAppointmentsQuerySchema,
  appointmentIdParamsSchema,
  cancelAppointmentSchema,
  createAppointmentSchema,
  doctorAppointmentsQuerySchema,
  patientAppointmentsQuerySchema,
  updateAppointmentStatusSchema
} from '../schemas';

const router = express.Router();

router.post('/', authenticateToken, validate(createAppointmentSchema), createAppointment);
router.get('/my-appointments', authenticateToken, authorizeRoles('PATIENT'), validate(patientAppointmentsQuerySchema, 'query'), getPatientAppointments);
router.get('/doctor-appointments', authenticateToken, authorizeRoles('DOCTOR'), validate(doctorAppointmentsQuerySchema, 'query'), getDoctorAppointments);
router.get('/admin-all', authenticateToken, authorizeRoles('ADMIN'), validate(adminAppointmentsQuerySchema, 'query'), getAdminAppointments);
router.put('/:id/status', authenticateToken, authorizeRoles('DOCTOR', 'ADMIN'), validate(appointmentIdParamsSchema, 'params'), validate(updateAppointmentStatusSchema), updateAppointmentStatus);
router.put('/:id/cancel', authenticateToken, validate(appointmentIdParamsSchema, 'params'), validate(cancelAppointmentSchema), cancelAppointment);

export default router;
