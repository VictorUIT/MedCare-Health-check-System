import express from 'express';
import { suggestSpecialty } from '../controllers/aiController';
import { validate } from '../middlewares/validate';
import { suggestSpecialtySchema } from '../schemas';

// 1. Tạo router cho các endpoint liên quan đến AI
const router = express.Router();

// 2. Định nghĩa route POST /suggest-specialty để gợi ý chuyên khoa dựa trên triệu chứng
router.post('/suggest-specialty', validate(suggestSpecialtySchema), suggestSpecialty);

export default router;
