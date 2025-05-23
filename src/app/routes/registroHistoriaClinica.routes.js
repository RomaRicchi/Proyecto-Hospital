import { Router } from 'express';
import {
	getRegistrosHistoria,
	getRegistroById,
	createRegistroHistoria,
	updateRegistroHistoria,
	deleteRegistroHistoria,
} from '../controllers/registroHistoriaClinica.controller.js';

const router = Router();

router.get('/', getRegistrosHistoria);
router.get('/:id', getRegistroById);
router.post('/', createRegistroHistoria);
router.put('/:id', updateRegistroHistoria);
router.delete('/:id', deleteRegistroHistoria);

export default router;
