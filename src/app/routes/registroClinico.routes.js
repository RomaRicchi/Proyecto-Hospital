import express from 'express';
import { 
    editarRegistro, 
    listarRegistros, 
    crearRegistro, 
    buscarPorDNI, 
    eliminarRegistro 
} from '../controllers/registroClinico.controller.js';

const router = express.Router();

router.get('/', listarRegistros);
router.post('/', crearRegistro);
router.put('/:id', editarRegistro);
router.delete('/:id', eliminarRegistro);
router.get('/dni/:dni', buscarPorDNI);

export default router;
