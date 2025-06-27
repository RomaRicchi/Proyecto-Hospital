import { Router } from 'express';
import {
	vistaCama, 
	getCamaById,
	createCama,
	updateCama,
	deleteCama,
	getCamasDisponiblesPorFecha,
	getCamasApi,
} from '../controllers/cama.controller.js';

const router = Router();
router.get('/vista', vistaCama); 
router.get('/disponibles', getCamasDisponiblesPorFecha);
router.get('/api/camas', getCamasApi);
router.get('/:id', getCamaById);
router.post('/', createCama);
router.put('/:id', updateCama);
router.delete('/:id', deleteCama);

export default router;
