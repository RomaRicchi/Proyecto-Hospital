import { Router } from 'express';
import {
	getCamas,
	getCamaById,
	createCama,
	updateCama,
	deleteCama,
} from '../controllers/cama.controller.js';

const router = Router();

router.get('/', getCamas);
router.get('/:id', getCamaById);
router.post('/', createCama);
router.put('/:id', updateCama);
router.delete('/:id', deleteCama);

export default router;
