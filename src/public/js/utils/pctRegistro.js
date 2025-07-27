import { calcularEdad } from './validarSectorPaciente.js';

export function mostrarInfoPaciente(p, cama = null) {
  const $info = $('#infoPaciente');

  if (!p) {
    $info.html('');
    return;
  }

  const edad = calcularEdad(p.fecha_nac);
  let html = `
    <div class="alert alert-info">
      <strong>Paciente:</strong> ${p.apellido_p}, ${p.nombre_p} &nbsp; | &nbsp;
      <strong>Edad:</strong> ${edad !== null ? `${edad} años` : 'No identificada'}
  `;
  if (cama) {
   html += ` &nbsp; | &nbsp; <strong>Cama:</strong> ${cama.nombre} - Hab ${cama.habitacion?.num ?? '??'} (${cama.habitacion?.sector?.nombre ?? 'Sin sector'})`;
  }

  if (Array.isArray(p.familiares) && p.familiares.length > 0) {
    const f = p.familiares[0];
    html += ` &nbsp; | &nbsp; <strong>Familiar:</strong> ${f.nombre} ${f.apellido} (${f.parentesco?.nombre || '-'}) – Tel: ${f.telefono || '-'}`;
  }

  html += `</div>`;
  $info.html(html);
}

export function tieneInternacionActiva(registros, idAdmision) {
  if (!idAdmision) return false;

  const ingresos = registros.filter(r =>
    r.id_tipo === 30 &&
    r.id_admision === idAdmision &&
    !!r.fecha
  );

  if (ingresos.length === 0) return false;

  const ultimoIngreso = ingresos.reduce((a, b) =>
    new Date(a.fecha) > new Date(b.fecha) ? a : b
  );

  const egresos = registros.filter(r =>
    r.id_tipo === 31 &&
    r.id_admision === idAdmision &&
    new Date(r.fecha) > new Date(ultimoIngreso.fecha)
  );

  return egresos.length === 0;
}




