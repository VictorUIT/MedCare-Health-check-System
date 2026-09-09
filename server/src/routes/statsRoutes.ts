import express from 'express';
import { getDashboardStats } from '../controllers/statsController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

// Tạo router cho các endpoint liên quan đến thống kê
const router = express.Router();

router.get('/dashboard', authenticateToken, authorizeRoles('ADMIN'), getDashboardStats);

export default router;
