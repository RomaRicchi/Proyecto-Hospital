import { Router } from 'express';
import {
	vistaCama, 
	getCamaById,
	createCama,
	updateCama,
	deleteCama,
	getCamasDisponiblesPorFecha,
	getCamasApi,
	getCamasReservadas,
	getCamasOcupadas
} from '../controllers/cama.controller.js';

const router = Router();

router.get('/ocupadas', getCamasOcupadas);
router.get('/vista', vistaCama); 
router.get('/disponibles', getCamasDisponiblesPorFecha);
router.get('/reservadas', getCamasReservadas); 
router.get('/api/camas', getCamasApi);
router.get('/:id', getCamaById); 
router.post('/', createCama);
router.put('/:id', updateCama);
router.delete('/:id', deleteCama);

export default router;
