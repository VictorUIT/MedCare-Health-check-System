import express from 'express';
import { suggestSpecialty } from '../controllers/aiController';
import { validate } from '../middlewares/validate';
import { suggestSpecialtySchema } from '../schemas';

const router = express.Router();

router.post('/suggest-specialty', validate(suggestSpecialtySchema), suggestSpecialty);

export default router;
