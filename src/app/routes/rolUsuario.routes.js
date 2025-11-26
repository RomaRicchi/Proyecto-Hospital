import express from 'express';
import {
  listarRoles,
  crearRol,
  actualizarRol,
  eliminarRol
} from '../controllers/rolUsuario.controller.js';

const router = express.Router();

router.get('/', listarRoles);
router.post('/', crearRol);
router.put('/:id', actualizarRol);
router.delete('/:id', eliminarRol);

export default router;
