import { Router } from 'express';
import {
  getSectores,
  getSectorById,
  createSector,
  updateSector,
  deleteSector
} from '../controllers/sector.controller.js';

const router = Router();

// 🔸 GET: Obtener todos los sectores
router.get('/', getSectores);

// 🔸 GET: Obtener sector por ID
router.get('/:id', getSectorById);

// 🔸 POST: Crear nuevo sector
router.post('/', createSector);

// 🔸 PUT: Actualizar sector por ID
router.put('/:id', updateSector);

// 🔸 DELETE: Eliminar sector por ID
router.delete('/:id', deleteSector);

export default router;

