import { Router } from 'express';
import {
	getPersonalAdministrativo,
	getPersonalAdministrativoById,
	createPersonalAdministrativo,
	updatePersonalAdministrativo,
	deletePersonalAdministrativo,
} from '../controllers/personalAdministrativo.controller.js';

const router = Router();

router.get('/', getPersonalAdministrativo);
router.get('/:id', getPersonalAdministrativoById);
router.post('/', createPersonalAdministrativo);
router.put('/:id', updatePersonalAdministrativo);
router.delete('/:id', deletePersonalAdministrativo);

export default router;
