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

// Rutas específicas primero
router.get('/localidad', getLocalidades); // GET /api/paciente/localidad
router.get('/genero', getGeneros); // GET /api/paciente/genero

// Luego las rutas con parámetro
router.get('/', getPacientes); // GET /api/paciente
router.get('/:id', getPacienteById); // GET /api/paciente/:id para editar
router.post('/', createPaciente); // POST /api/paciente
router.put('/:id', updatePaciente); // PUT /api/paciente/:id
router.delete('/:id', deletePaciente); // DELETE /api/paciente/:id

export default router;
