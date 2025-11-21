import { Router } from 'express';
import {
  getDia,
  getDiaById,
  createDia,
  updateDia,
  deleteDia,
} from '../controllers/dia.controller.js';

const router = Router();

router.get('/', getDia);
router.get('/:id', getDiaById);
router.post('/', createDia);
router.put('/:id', updateDia);
router.delete('/:id', deleteDia);

export default router;
