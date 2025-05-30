import { Router } from 'express';
import {
  getHabitaciones,
  getHabitacionById,
  createHabitacion,
  updateHabitacion,
  deleteHabitacion
} from '../controllers/habitacion.controller.js';

const router = Router();

// 🔸 GET: Obtener todas las habitaciones
router.get('/', getHabitaciones);

// 🔸 GET: Obtener una habitación por ID
router.get('/:id', getHabitacionById);

// 🔸 POST: Crear nueva habitación
router.post('/', createHabitacion);

// 🔸 PUT: Actualizar habitación por ID
router.put('/:id', updateHabitacion);

// 🔸 DELETE: Eliminar habitación por ID
router.delete('/:id', deleteHabitacion);

export default router;
