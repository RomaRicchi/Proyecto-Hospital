import { Router } from 'express';
import {
  getMotivosIngreso,
  createMotivoIngreso,
  getMotivoIngresoById,
  updateMotivoIngreso,
  deleteMotivoIngreso
} from '../controllers/motivoIngreso.controller.js';

const router = Router();

router.get('/', getMotivosIngreso);
router.post('/', createMotivoIngreso);      
router.get('/:id', getMotivoIngresoById);     
router.put('/:id', updateMotivoIngreso);         
router.delete('/:id', deleteMotivoIngreso);      

export default router;
