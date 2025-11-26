import { Router } from 'express';
import {
  getSectores,
  getSectorById,
  createSector,
  updateSector,
  deleteSector
} from '../controllers/sector.controller.js';

const router = Router();

router.get('/', getSectores);
router.get('/:id', getSectorById);
router.post('/', createSector);
router.put('/:id', updateSector);
router.delete('/:id', deleteSector);

export default router;

