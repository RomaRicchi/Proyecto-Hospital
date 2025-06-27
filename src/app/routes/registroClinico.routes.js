import express from 'express';
import { listarRegistros, crearRegistro, buscarPorDNI, eliminarRegistro } from '../controllers/registroClinico.controller.js';

const router = express.Router();

router.get('/', listarRegistros);
router.post('/', crearRegistro);
router.delete('/:id', eliminarRegistro);
router.get('/dni/:dni', buscarPorDNI);

export default router;
