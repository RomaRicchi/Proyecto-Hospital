import { Router } from 'express';
import {
	getPacientes,
	getPacienteById,
	createPaciente,
	getGeneros,
	updatePaciente,
	getLocalidades,
	deletePaciente,
} from '../controllers/paciente.controller.js';

const router = Router();

router.get('/localidad', getLocalidades); 
router.get('/genero', getGeneros); 

router.get('/', getPacientes); 
router.get('/:id', getPacienteById); 
router.post('/', createPaciente); 
router.put('/:id', updatePaciente); 
router.delete('/:id', deletePaciente); 

export default router;
