import { Router } from 'express';
import {
  getCamas,
  getCamaById,
  createCama,
  updateCama,
  deleteCama
} from '../controllers/cama.controller.js';

const router = Router();

// 🔸 GET: Obtener todas las camas
router.get('/', getCamas);

// 🔸 GET: Obtener cama por ID
router.get('/:id', getCamaById);

// 🔸 POST: Crear nueva cama
router.post('/', createCama);

// 🔸 PUT: Actualizar cama por ID
router.put('/:id', updateCama);

// 🔸 DELETE: Eliminar cama por ID
router.delete('/:id', deleteCama);

export default router;

