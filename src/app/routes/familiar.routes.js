import { Router } from 'express';
import {
	getFamiliares,
	getFamiliarById,
	getFamiliarByPaciente,
	createFamiliar,
	updateFamiliar,
	deleteFamiliar,
} from '../controllers/familiar.controller.js';

const router = Router();

// ✅ Listar todos los familiares
router.get('/', getFamiliares);

// ✅ Obtener familiar por su ID
router.get('/:id', getFamiliarById);

// ✅ Obtener familiar asociado a un paciente (nuevo)
router.get('/paciente/:id', getFamiliarByPaciente);

// ✅ Crear nuevo familiar
router.post('/', createFamiliar);

// ✅ Actualizar familiar existente
router.put('/:id', updateFamiliar);

// ✅ Eliminar (borrado lógico) familiar por ID
router.delete('/:id', deleteFamiliar);

export default router;
