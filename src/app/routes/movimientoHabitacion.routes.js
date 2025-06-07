import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
	getMovimientosHabitacion,
	getMovimientoHabitacionById,
	createMovimientoHabitacion,
	updateMovimientoHabitacion,
	verificarGenero,
	deleteMovimientoHabitacion,
	reservarCama,
} from '../controllers/movimientoHabitacion.controller.js';

const router = Router();

router.post('/verificar-genero', verificarGenero);

router.get('/', getMovimientosHabitacion);
router.get('/:id', getMovimientoHabitacionById);
router.post('/', createMovimientoHabitacion);
router.put('/:id', updateMovimientoHabitacion);
router.delete('/:id', deleteMovimientoHabitacion);

// 🔸 Agregar la ruta para reservar cama, protegida con isAuthenticated
router.post('/reservar/:id_cama', isAuthenticated, reservarCama);

export default router;
