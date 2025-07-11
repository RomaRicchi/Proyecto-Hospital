import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
	getMovimientosHabitacion,
	getMovimientoHabitacionById,
	createMovimientoHabitacion,
	updateMovimientoHabitacion,
	verificarGenero,
	deleteMovimientoHabitacion,
	getMovimientosActivosPorHabitacion,
} from '../controllers/movimientoHabitacion.controller.js';

import {
	confirmarReserva,
	cancelarReserva
} from '../controllers/confirmarReserva.controller.js';

const router = Router();

router.post('/verificar-genero', verificarGenero);
router.get('/activos/habitacion/:id_habitacion', getMovimientosActivosPorHabitacion);
router.get('/', getMovimientosHabitacion);
router.get('/:id', getMovimientoHabitacionById);
router.post('/', createMovimientoHabitacion);
router.put('/:id', updateMovimientoHabitacion);
router.delete('/:id', deleteMovimientoHabitacion);

// 🔸 Rutas especiales con autenticación

router.post('/confirmar-reserva', isAuthenticated, confirmarReserva);
router.put('/cancelar-reserva/:id_movimiento', isAuthenticated, cancelarReserva); 

export default router;

