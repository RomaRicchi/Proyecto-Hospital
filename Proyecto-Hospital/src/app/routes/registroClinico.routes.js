import express from 'express';
import { 
    editarRegistro, 
    listarRegistros, 
    crearRegistro, 
    buscarPorDNI, 
    eliminarRegistro,
    vistaRegistroClinico
} from '../controllers/registroClinico.controller.js';

const router = express.Router();

router.get('/registroClinico/:id', vistaRegistroClinico);
router.get('/', listarRegistros);
router.post('/', crearRegistro);
router.put('/:id', editarRegistro);
router.delete('/:id', eliminarRegistro);
router.get('/dni/:dni', buscarPorDNI);

export default router;
