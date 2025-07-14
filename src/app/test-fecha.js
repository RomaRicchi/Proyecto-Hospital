import { ajustarFechaLocal } from './helpers/timezone.helper.js';

const fecha = '2025-07-13T16:00:00.000Z';
console.log('UTC:', fecha);
console.log('Argentina:', ajustarFechaLocal(fecha).toLocaleString('es-AR'));
