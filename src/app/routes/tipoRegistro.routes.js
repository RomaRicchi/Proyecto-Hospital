import { Router } from 'express';
import {
	getTiposRegistro,
	getTipoRegistroById,
	createTipoRegistro,
	updateTipoRegistro,
	deleteTipoRegistro,
} from '../controllers/tipoRegistro.controller.js';

const router = Router();

router.get('/', getTiposRegistro);
router.get('/:id', getTipoRegistroById);
router.post('/', createTipoRegistro);
router.put('/:id', updateTipoRegistro);
router.delete('/:id', deleteTipoRegistro);

export default router;
