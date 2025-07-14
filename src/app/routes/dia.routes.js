import { Router } from 'express';
import {
  getDiasSemana,
  getDiaSemanaById,
  createDiaSemana,
  updateDiaSemana,
  deleteDiaSemana,
} from '../controllers/diaSemana.controller.js';

const router = Router();

router.get('/', getDiasSemana);
router.get('/:id', getDiaSemanaById);
router.post('/', createDiaSemana);
router.put('/:id', updateDiaSemana);
router.delete('/:id', deleteDiaSemana);

export default router;
