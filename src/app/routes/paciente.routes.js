import { Router } from 'express';
import {
	getPacientes,
	getPacienteById,
	createPaciente,
	getGeneros,
	updatePaciente,
	getLocalidades,
	deletePaciente,
	buscarPacientes,
	existeNNPorDNI,
	obtenerPacientePorDNI,
	obtenerNNconAdmision
} from '../controllers/paciente.controller.js';

const router = Router();
router.get('/get-nn/:dni', obtenerNNconAdmision);
router.get('/get-pac/:dni', obtenerPacientePorDNI);
router.get('/existe-nn/:dni', existeNNPorDNI);
router.get('/localidad', getLocalidades); 
router.get('/genero', getGeneros); 
router.get('/buscar', buscarPacientes);
router.get('/', getPacientes); 
router.get('/:id', getPacienteById); 
router.post('/', createPaciente); 
router.put('/:id', updatePaciente); 
router.delete('/:id', deletePaciente); 

export default router;
