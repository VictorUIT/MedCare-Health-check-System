import express from 'express';
import { getMyPatientProfile } from '../controllers/patientController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

// Tạo router cho endpoint liên quan đến bệnh nhân
const router = express.Router();

router.get('/me', authenticateToken, authorizeRoles('PATIENT'), getMyPatientProfile);

export default router;
