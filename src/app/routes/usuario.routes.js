import { Router } from 'express';
import {
	getUsuarios,
	getUsuarioById,
	createUsuario,
	updateUsuario,
	deleteUsuario,
	listarUsuariosMedicos,
	vistaPerfil,
  actualizarPerfil,
  cambiarPassword,
} from '../controllers/usuario.controller.js';

const router = Router();
router.post('/cambiar-password', cambiarPassword);
router.get('/perfil', vistaPerfil);
router.post('/perfil', actualizarPerfil);
router.get('/medicos', listarUsuariosMedicos);
router.get('/validar-email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const usuario = await Usuario.findOne({ where: { email } });
    res.json({ existe: !!usuario });
  } catch (error) {
    console.error('Error al validar email:', error);
    res.status(500).json({ existe: false });
  }
});

router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);


export default router;
