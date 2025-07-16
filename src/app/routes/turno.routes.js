import { Router } from 'express';
import {
  getTurnos,
  getTurnoById,
  createTurno,
  updateTurno,
  deleteTurno,
  getTurnosListado,
} from '../controllers/turno.controller.js';

const router = Router();

router.get('/listado', getTurnosListado);
router.get('/', getTurnos);
router.get('/:id', getTurnoById);
router.post('/', createTurno);
router.put('/:id', updateTurno);
router.delete('/:id', deleteTurno);

export default router;
