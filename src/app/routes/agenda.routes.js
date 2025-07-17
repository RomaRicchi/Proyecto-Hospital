import { Router } from 'express';
import {
  getAgendas,
  getAgendaById,
  createAgenda,
  updateAgenda,
  deleteAgenda,
  buscarPersonal,
  getAgendasRecurrentes,
  getCalendarioCompleto,
  getAgendasByProfesional,
} from '../controllers/agenda.controller.js';

const router = Router();
router.get('/profesional/:id', getAgendasByProfesional);
router.get('/', getAgendas);
router.get('/buscar', buscarPersonal);
router.get('/semana', getAgendasRecurrentes);
router.get('/calendario/turnos', getCalendarioCompleto);
router.get('/:id', getAgendaById);
router.post('/', createAgenda);
router.put('/:id', updateAgenda);
router.delete('/:id', deleteAgenda);

export default router;
