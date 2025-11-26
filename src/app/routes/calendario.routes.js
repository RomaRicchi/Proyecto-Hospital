import { Router } from 'express';
import {
  getCalendarioCompleto,
  vistaCalendario
} from '../controllers/calendario.controller.js';

const router = Router();

router.get('/vista', vistaCalendario);
router.get('/eventos', getCalendarioCompleto);

export default router;
