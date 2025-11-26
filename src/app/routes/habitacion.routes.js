import { Router } from 'express';
import {
  getHabitaciones,
  getHabitacionById,
  createHabitacion,
  updateHabitacion,
  deleteHabitacion
} from '../controllers/habitacion.controller.js';

const router = Router();
router.get('/', getHabitaciones);
router.get('/:id', getHabitacionById);
router.post('/', createHabitacion);
router.put('/:id', updateHabitacion);
router.delete('/:id', deleteHabitacion);

export default router;
