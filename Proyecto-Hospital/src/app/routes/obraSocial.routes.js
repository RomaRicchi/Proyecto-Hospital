import { Router } from 'express';
import {
	getObrasSociales,
	getObraSocialById,
	createObraSocial,
	updateObraSocial,
	deleteObraSocial,
} from '../controllers/obraSocial.controller.js';

const router = Router();

router.get('/', getObrasSociales);
router.get('/:id', getObraSocialById);
router.post('/', createObraSocial);
router.put('/:id', updateObraSocial);
router.delete('/:id', deleteObraSocial);

export default router;
