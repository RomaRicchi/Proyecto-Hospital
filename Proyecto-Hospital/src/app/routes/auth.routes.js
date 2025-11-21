import { Router } from 'express';
const router = Router();

import fs from 'fs/promises';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { login, logout, vistaLogin } from '../controllers/auth.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/home', async (req, res) => {
	try {
		const obrasPath = join(__dirname, '../../data/obras_sociales.dat');
		const especialidadesPath = join(__dirname, '../../data/especialidades.dat');

		const obras = await fs.readFile(obrasPath, 'utf-8');
		const especialidades = await fs.readFile(especialidadesPath, 'utf-8');

		const listaObras = obras.trim().split('\n');
		const listaEsp = especialidades.trim().split('\n');

		let medicos = [];

		try {
			const response = await axios.get(
				'https://randomuser.me/api/?results=12&nat=us,es,fr'
			);
			const results = response.data.results;

			medicos = results.map((user) => ({
				nombre: `Dr/a ${user.name.first} ${user.name.last}`,
				especialidad:
					listaEsp[Math.floor(Math.random() * listaEsp.length)] || 'General',
				foto: user.picture.medium,
			}));
		} catch (apiError) {
			medicos = Array.from({ length: 12 }, (_, i) => ({
				nombre: `Dr/a. Emergencia ${i + 1}`,
				especialidad: listaEsp[i % listaEsp.length] || 'General',
				foto: '/img/docG.png',
			}));
		}

		res.render('inicio', { listaObras, listaEsp, medicos });
	} catch (err) {
		res.status(500).send('Error al cargar la página principal');
	}
});

router.get('/login', vistaLogin);    
router.post('/login', login);        
router.get('/logout', logout);       


export default router;
