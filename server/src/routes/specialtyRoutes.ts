import express from 'express';
import {
  getSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty
} from '../controllers/specialtyController';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { idParamsSchema } from '../schemas/commonSchemas';
import { specialtySchema, updateSpecialtySchema } from '../schemas/specialtySchemas';

const router = express.Router();

router.get('/', getSpecialties);
router.get('/:id', validate(idParamsSchema, 'params'), getSpecialtyById);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), validate(specialtySchema), createSpecialty);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), validate(idParamsSchema, 'params'), validate(updateSpecialtySchema), updateSpecialty);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), validate(idParamsSchema, 'params'), deleteSpecialty);

export default router;
