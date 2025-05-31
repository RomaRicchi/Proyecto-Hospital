import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { vistaReservarCama } from '../controllers/cama.controller.js'; 
import {
	getCamas,
	getCamaById,
	createCama,
	updateCama,
	deleteCama,
	getCamasApi,
} from '../controllers/cama.controller.js';

const router = Router();

router.get('/api/camas', getCamasApi);
router.get('/', getCamas);
router.get('/:id', getCamaById);
router.post('/', createCama);
router.put('/:id', updateCama);
router.delete('/:id', deleteCama);   

export default router;
