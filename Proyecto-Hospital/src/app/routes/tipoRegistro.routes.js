import express from 'express';
import {
  listarTipos,
  crearTipo,
  actualizarTipo,
  eliminarTipo
} from '../controllers/tipoRegistro.controller.js';

const router = express.Router();

router.get('/', listarTipos);
router.post('/', crearTipo);
router.put('/:id', actualizarTipo);
router.delete('/:id', eliminarTipo);

export default router;
