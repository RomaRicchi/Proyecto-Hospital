import express from 'express';
import {
  vistaReservarCama,
  confirmarReserva,
  cancelarReserva,
  eliminarReservasVencidas
} from '../controllers/confirmarReserva.controller.js';

const router = express.Router();

router.delete('/eliminar-vencidas', eliminarReservasVencidas);
router.get('/reserva-cama', vistaReservarCama);
router.post('/confirmar-reserva/:id_movimiento', confirmarReserva);
router.post('/cancelar-reserva/:id_movimiento', cancelarReserva);

export default router;
