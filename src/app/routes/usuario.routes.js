import { Router } from 'express';
import {
	getUsuarios,
	getUsuarioById,
	createUsuario,
	updateUsuario,
	deleteUsuario,
	listarUsuariosMedicos,
	vistaCambiarPassword,
	vistaRecuperarPassword,
	vistaPerfil,
	actualizarPerfil,
} from '../controllers/usuario.controller.js';

const router = Router();

router.post('/perfil', actualizarPerfil);
router.post('/cambiar-password', vistaCambiarPassword);
router.get('/recuperar-password', vistaRecuperarPassword);
router.get('/perfil',vistaPerfil);
router.get('/medicos', listarUsuariosMedicos);
router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
