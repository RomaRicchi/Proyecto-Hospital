import { Router } from 'express';
import {
  getGeneros,
  getGeneroById,
  createGenero,
  updateGenero,
  deleteGenero
} from '../controllers/genero.controller.js';

const router = Router();

// 🔸 GET: Obtener todos los géneros
router.get('/', getGeneros);

// 🔸 GET: Obtener género por ID
router.get('/:id', getGeneroById);

// 🔸 POST: Crear nuevo género
router.post('/', createGenero);

// 🔸 PUT: Actualizar género por ID
router.put('/:id', updateGenero);

// 🔸 DELETE: Eliminar género por ID
router.delete('/:id', deleteGenero);

export default router;
