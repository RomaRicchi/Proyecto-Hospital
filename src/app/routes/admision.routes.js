import { Router } from 'express';
import {
	getAdmisiones,
	getAdmisionById,
	createAdmision,
	updateAdmision,
	deleteAdmision,
} from '../controllers/admision.controller.js';

const router = Router();

router.get('/', getAdmisiones);
router.get('/:id', getAdmisionById);
router.post('/', createAdmision);
router.put('/:id', updateAdmision);
router.delete('/:id', deleteAdmision);

export default router;
