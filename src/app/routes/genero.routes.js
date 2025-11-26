import { Router } from 'express';
import {
  getGeneros,
  getGeneroById,
  createGenero,
  updateGenero,
  deleteGenero
} from '../controllers/genero.controller.js';

const router = Router();

router.get('/', getGeneros);
router.get('/:id', getGeneroById);
router.post('/', createGenero);
router.put('/:id', updateGenero);
router.delete('/:id', deleteGenero);

export default router;
