import express from 'express';
import {
	getCamasApi,
	getCamas,
	getCamaById,
	getCamasDisponiblesPorFecha,
	createCama,
	updateCama,
	deleteCama,
	vistaReservarCama,
} from '../controllers/cama.controller.js';

const router = express.Router();


router.get('/disponibles', getCamasDisponiblesPorFecha);
router.get('/', getCamasApi);
router.get('/:id', getCamaById);

// Vistas
router.get('/vista', getCamas); // Evitá conflicto con /:id
router.get('/reservar', vistaReservarCama);

// CRUD
router.post('/', createCama);
router.put('/:id', updateCama);
router.delete('/:id', deleteCama);

export default router;
