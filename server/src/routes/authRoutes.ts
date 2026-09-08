import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { loginSchema, registerSchema, updateProfileSchema } from '../schemas';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, validate(updateProfileSchema), updateProfile);

export default router;
