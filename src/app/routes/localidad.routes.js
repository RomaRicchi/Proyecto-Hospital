import { Router } from 'express';
import {
	getLocalidades,
	getLocalidadById,
	createLocalidad,
	updateLocalidad,
	deleteLocalidad,
} from '../controllers/localidad.controller.js';

const router = Router();

router.get('/', getLocalidades);
router.get('/:id', getLocalidadById);
router.post('/', createLocalidad);
router.put('/:id', updateLocalidad);
router.delete('/:id', deleteLocalidad);

export default router;
