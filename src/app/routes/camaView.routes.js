import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { vistaReservarCama } from '../controllers/cama.controller.js';

const router = Router();
router.get('/camas/reservar', isAuthenticated, vistaReservarCama);
export default router;
