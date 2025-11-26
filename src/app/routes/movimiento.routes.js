import { Router } from 'express';
import {
	getMovimientos,
	getMovimientoById,
	createMovimiento,
	updateMovimiento,
	deleteMovimiento,
} from '../controllers/movimiento.controller.js';

const router = Router();

router.get('/', getMovimientos);
router.get('/:id', getMovimientoById);
router.post('/', createMovimiento);
router.put('/:id', updateMovimiento);
router.delete('/:id', deleteMovimiento);

export default router;
