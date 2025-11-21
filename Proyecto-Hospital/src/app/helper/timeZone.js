export function parseFechaUTC(fechaStr) {
  if (typeof fechaStr === 'string' && !fechaStr.endsWith('Z')) {
    return new Date(fechaStr.replace(' ', 'T') + 'Z');
  }
  return new Date(fechaStr);
}

export function validarHoraRango(hora_inicio, hora_fin) {
  if (!/^\d{2}:\d{2}$/.test(hora_inicio) || !/^\d{2}:\d{2}$/.test(hora_fin)) return false;

  const [h1, m1] = hora_inicio.split(':').map(Number);
  const [h2, m2] = hora_fin.split(':').map(Number);

  const inicio = new Date(0, 0, 0, h1, m1);
  const fin = new Date(0, 0, 0, h2, m2);

  return fin > inicio;
}

