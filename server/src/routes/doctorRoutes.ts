import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctorController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createDoctorSchema, doctorParamsSchema, doctorQuerySchema, updateDoctorSchema } from '../schemas';

const router = express.Router();

router.get('/', validate(doctorQuerySchema, 'query'), getDoctors);
router.get('/:id', validate(doctorParamsSchema, 'params'), getDoctorById);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), validate(createDoctorSchema), createDoctor);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'DOCTOR'), validate(doctorParamsSchema, 'params'), validate(updateDoctorSchema), updateDoctor);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), validate(doctorParamsSchema, 'params'), deleteDoctor);

export default router;
