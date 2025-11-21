import { Router } from 'express';
import {
	getPersonalSalud,
	getPersonalSaludById,
	createPersonalSalud,
	updatePersonalSalud,
	deletePersonalSalud,
} from '../controllers/personalSalud.controller.js';
import { getPacientesAsignadosPorMedico
} from '../controllers/dashSalud.controller.js';

const router = Router();

router.get('/asignados', getPacientesAsignadosPorMedico);
router.get('/', getPersonalSalud);
router.get('/:id', getPersonalSaludById);
router.post('/', createPersonalSalud);
router.put('/:id', updatePersonalSalud);
router.delete('/:id', deletePersonalSalud);

export default router;
