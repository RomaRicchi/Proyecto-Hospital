import { Router } from 'express';
import {
  getEstadosTurno,
  getEstadoTurnoById,
  createEstadoTurno,
  updateEstadoTurno,
  deleteEstadoTurno,
} from '../controllers/estadoTurno.controller.js';

const router = Router();

router.get('/', getEstadosTurno);
router.get('/:id', getEstadoTurnoById);
router.post('/', createEstadoTurno);
router.put('/:id', updateEstadoTurno);
router.delete('/:id', deleteEstadoTurno);

export default router;
