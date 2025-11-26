import { Router } from 'express';
import {
	getParentescos,
	getParentescoById,
	createParentesco,
	updateParentesco,
	deleteParentesco,
} from '../controllers/parentesco.controller.js';

const router = Router();

router.get('/', getParentescos);
router.get('/:id', getParentescoById);
router.post('/', createParentesco);
router.put('/:id', updateParentesco);
router.delete('/:id', deleteParentesco);

export default router;
