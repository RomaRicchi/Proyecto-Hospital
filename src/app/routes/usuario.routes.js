import { Router } from 'express';
import {
	getUsuarios,
	getUsuarioById,
	createUsuario,
	updateUsuario,
	deleteUsuario,
	listarUsuariosMedicos,
} from '../controllers/usuario.controller.js';

const router = Router();
router.get('/medicos', listarUsuariosMedicos);
router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
