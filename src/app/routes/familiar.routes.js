import { Router } from 'express';
import {
	getFamiliares,
	getFamiliarById,
	getFamiliarByPacienteId,
	createFamiliar,
	updateFamiliar,
	deleteFamiliar,
} from '../controllers/familiar.controller.js';

const router = Router();

router.get('/', getFamiliares);
router.get('/:id', getFamiliarById);
router.get('/paciente/buscar', getFamiliarByPacienteId); // ?pacienteId=#
router.post('/', createFamiliar);
router.put('/:id', updateFamiliar);
router.delete('/:id', deleteFamiliar);

export default router;
