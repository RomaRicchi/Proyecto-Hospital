import express from 'express';
import {
  vistaReservarCama,
  confirmarReserva,
  cancelarReserva
} from '../controllers/confirmarReserva.controller.js';

const router = express.Router();

router.get('/reserva-cama', vistaReservarCama);
router.post('/confirmar-reserva', confirmarReserva);
router.post('/cancelar-reserva/:id_movimiento', cancelarReserva);

export default router;
