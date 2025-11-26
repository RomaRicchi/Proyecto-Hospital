import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import viewsRoutes from './routes/views.routes.js';

import { iniciarEliminacionReservas } from '../jobs/eliminarReservasVencidas.js';
import { iniciarActualizacionTurnos } from '../jobs/actualizarTurnos.js'; 
import authRoutes from './routes/auth.routes.js';
import pacientesRoutes from './routes/paciente.routes.js';
import familiaresRoutes from './routes/familiar.routes.js';
import usuariosRoutes from './routes/usuario.routes.js';
import rolUsuarioRoutes from './routes/rolUsuario.routes.js';
import generoRoutes from './routes/genero.routes.js';
import localidadRoutes from './routes/localidad.routes.js';
import obraSocialRoutes from './routes/obraSocial.routes.js';
import parentescoRoutes from './routes/parentesco.routes.js';
import personalAdminRoutes from './routes/personalAdministrativo.routes.js';
import personalSaludRoutes from './routes/personalSalud.routes.js';
import especialidadRoutes from './routes/especialidad.routes.js';
import sectorRoutes from './routes/sector.routes.js';
import habitacionRoutes from './routes/habitacion.routes.js';
import camaRoutes from './routes/cama.routes.js';
import movimientoRoutes from './routes/movimiento.routes.js';
import movimientoHabitacionRoutes from './routes/movimientoHabitacion.routes.js';
import admisionRoutes from './routes/admision.routes.js';
import altaRoutes from './routes/alta.routes.js';
import registroClinicoRoutes from './routes/registroClinico.routes.js';
import motivoIngresoRoutes from './routes/motivoIngreso.routes.js';
import tipoRegistroRoutes from './routes/tipoRegistro.routes.js';
import emergenciaRoutes from './routes/emergencia.routes.js';
import reservasRoutes from './routes/reservas.routes.js'; 
import diaRoutes from './routes/dia.routes.js';
import agendaRoutes from './routes/agenda.routes.js';
import turnoRoutes from './routes/turno.routes.js';
import estadoTurnoRoutes from './routes/estadoTurno.routes.js';
import recuperacionRoutes from './routes/recuperacion.routes.js';
import calendarioRoutes from './routes/calendario.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/* 📋 Middleware */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
/* 📦 Sesion */
app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secreto',
		resave: false,
		saveUninitialized: false,
	})
);

/* 🎨 Motor de vistas */
app.set('view engine', 'pug');
app.set('views', join(__dirname, '../views'));

/* 📁 Archivos estaticos */
app.use(express.static(join(__dirname, '../public')));
app.use('/sb-admin', express.static(join(__dirname, '../public/sb-admin')));
app.use('/css', express.static(join(__dirname, '../public/css')));
app.use('/js', express.static(join(__dirname, '../public/js')));


app.use((req, res, next) => {
	res.locals.usuario = req.session.usuario || null;
	res.locals.autenticado = !!req.session.usuario;
	next();
});

app.use((req, res, next) => {
	res.locals.currentPath = req.path;
	next();
});

/* 🛣️ Rutas API REST */
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/familiares', familiaresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolUsuarioRoutes);
app.use('/api/genero', generoRoutes);
app.use('/api/localidades', localidadRoutes);
app.use('/api/obras-sociales', obraSocialRoutes);
app.use('/api/parentescos', parentescoRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/sectores', sectorRoutes);
app.use('/api/habitaciones', habitacionRoutes);
app.use('/api/camas', camaRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/movimientos_habitacion', movimientoHabitacionRoutes);
app.use('/api/admisiones', admisionRoutes);
app.use('/api/admisiones', altaRoutes);
app.use('/api/registro-clinico', registroClinicoRoutes);
app.use('/api/motivos_ingreso', motivoIngresoRoutes);
app.use('/api/tipos-registro', tipoRegistroRoutes);
app.use('/api/emergencias', emergenciaRoutes);
app.use('/api/personal-administrativo', personalAdminRoutes);
app.use('/api/personal-salud', personalSaludRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/dias-semana', diaRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/estadoTurno', estadoTurnoRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/recuperacion', recuperacionRoutes);
app.use('/api/calendario', calendarioRoutes);
/* 🛣️ Rutas principales */
app.use('/', authRoutes);
app.use('/', viewsRoutes);

iniciarActualizacionTurnos();
iniciarEliminacionReservas();
/* 🌐 Exportar app */
export default app;
