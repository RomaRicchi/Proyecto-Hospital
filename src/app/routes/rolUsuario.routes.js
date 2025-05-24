import { Router } from 'express';
import {
	getRolesUsuario,
	getRolUsuarioById,
	createRolUsuario,
	updateRolUsuario,
	deleteRolUsuario,
} from '../controllers/rolUsuario.controller.js';

const router = Router();

router.get('/', getRolesUsuario);
router.get('/:id', getRolUsuarioById);
router.post('/', createRolUsuario);
router.put('/:id', updateRolUsuario);
router.delete('/:id', deleteRolUsuario);

export default router;
