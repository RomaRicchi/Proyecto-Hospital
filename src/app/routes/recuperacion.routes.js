import { Router } from 'express';
import {
  enviarCorreoRecuperacion,
  vistaFormularioRestablecer,
  procesarRestablecerPassword
} from '../controllers/recuperacion.controller.js';

const router = Router();

router.post('/recuperar-password', enviarCorreoRecuperacion);
router.get('/restablecer-password/:token', vistaFormularioRestablecer); 
router.post('/restablecer-password/:token', procesarRestablecerPassword);

export default router;

