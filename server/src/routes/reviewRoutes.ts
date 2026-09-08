import express from 'express';
import { createReview } from '../controllers/reviewController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createReviewSchema } from '../schemas';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('PATIENT'), validate(createReviewSchema), createReview);

export default router;
