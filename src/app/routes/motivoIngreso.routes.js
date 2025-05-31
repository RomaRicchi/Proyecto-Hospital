import { Router } from 'express';
import {
  getMotivosIngreso,
  createMotivoIngreso,
  getMotivoIngresoById,
  updateMotivoIngreso,
  deleteMotivoIngreso
} from '../controllers/motivoIngreso.controller.js';

const router = Router();

// Todos los endpoints están relacionados a '/api/motivos_ingreso' (se monta en app.js)
router.get('/', getMotivosIngreso);              // GET /api/motivos_ingreso
router.post('/', createMotivoIngreso);           // POST /api/motivos_ingreso
router.get('/:id', getMotivoIngresoById);        // GET /api/motivos_ingreso/:id
router.put('/:id', updateMotivoIngreso);         // PUT /api/motivos_ingreso/:id
router.delete('/:id', deleteMotivoIngreso);      // DELETE /api/motivos_ingreso/:id

export default router;
