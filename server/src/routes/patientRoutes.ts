import express from 'express';
import { getMyPatientProfile } from '../controllers/patientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.get('/me', authenticateToken, authorizeRoles('PATIENT'), getMyPatientProfile);

export default router;
