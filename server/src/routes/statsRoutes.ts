import express from 'express';
import { getDashboardStats } from '../controllers/statsController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/dashboard', authenticateToken, authorizeRoles('ADMIN'), getDashboardStats);

export default router;
