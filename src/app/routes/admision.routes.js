import { Router } from 'express';
import {
  getAdmisiones,
  getAdmisionById,
  createAdmision,
  updateAdmision,
  deleteAdmision,
  buscarAdmisionVigente,
  darAltaPaciente
} from '../controllers/admision.controller.js';

const router = Router();

// Rutas específicas primero
router.get('/paciente/:dni/admisiones-vigentes', buscarAdmisionVigente); // Buscar admisión activa
router.post('/paciente/:dni/alta', darAltaPaciente); // Dar de alta al paciente

// Rutas CRUD generales
router.get('/', getAdmisiones);
router.get('/:id', getAdmisionById);
router.post('/', createAdmision);
router.put('/:id', updateAdmision);
router.delete('/:id', deleteAdmision);

export default router;