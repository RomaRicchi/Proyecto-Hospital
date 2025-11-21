import express from 'express';
import {
  listarEspecialidades,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad
} from '../controllers/especialidad.controller.js';

const router = express.Router();

router.get('/', listarEspecialidades);
router.post('/', crearEspecialidad);
router.put('/:id', actualizarEspecialidad);
router.delete('/:id', eliminarEspecialidad);

export default router;