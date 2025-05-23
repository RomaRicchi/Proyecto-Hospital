import { Router } from 'express';
import {
	getMovimientosHabitacion,
	getMovimientoHabitacionById,
	createMovimientoHabitacion,
	updateMovimientoHabitacion,
	deleteMovimientoHabitacion,
} from '../controllers/movimientoHabitacion.controller.js';

const router = Router();

router.get('/', getMovimientosHabitacion);
router.get('/:id', getMovimientoHabitacionById);
router.post('/', createMovimientoHabitacion);
router.put('/:id', updateMovimientoHabitacion);
router.delete('/:id', deleteMovimientoHabitacion);

export default router;
