import { configurarBusquedaDeCamas } from './utils/validacionFechas.js';

function buscarCamasDisponibles(fechaSeleccionada) {
  $('#tablaCamasContainer').html(
    '<div class="text-center my-4"><div class="spinner-border"></div> Cargando...</div>'
  );

  fetch(`/api/camas/disponibles?fecha=${fechaSeleccionada}`)
    .then((res) => res.json())
    .then((camas) => {
      renderTablaCamas(camas);
    })
    .catch((err) => {
      console.error('❌ Error en fetch camas:', err);
      $('#tablaCamasContainer').html(
        '<div class="alert alert-danger">Error al cargar las camas.</div>'
      );
    });
}

function renderTablaCamas(camas) {
  const fechaSeleccionada = $('#fecha_busqueda').val();

  let html = `
    <table id="tablaCamas" class="table table-bordered table-hover">
      <thead class="table-light">
        <tr>
          <th>Sector</th>
          <th>Habitación</th>
          <th>Cama</th>
          <th>Estado</th>
          <th>Desinfección</th>
          <th>Paciente</th>
          <th>Género</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
  `;

  if (camas.length === 0) {
    html += `<tr><td colspan="8" class="text-center">No hay camas para la fecha seleccionada.</td></tr>`;
  } else {
    camas.forEach((cama) => {
      const desinfeccionBadge = Number(cama.desinfeccion) === 1
        ? '<span class="badge bg-success">Sí</span>'
        : '<span class="badge bg-secondary">No</span>';

      const fechaSeleccionadaStr = fechaSeleccionada;
      let estado = 'Disponible';
      let paciente = cama.paciente || '-';
      let genero = cama.genero || '-';

      if (Array.isArray(cama.movimientos)) {
        cama.movimientos.forEach((mov, i) => {
          const ingresoStr = mov.fecha_hora_ingreso.slice(0, 10);
          const egresoStr = mov.fecha_hora_egreso ? mov.fecha_hora_egreso.slice(0, 10) : null;
          const enFecha = ingresoStr <= fechaSeleccionadaStr && (!egresoStr || egresoStr >= fechaSeleccionadaStr);

          if (enFecha) {
            if (mov.id_mov === 1) estado = 'Ocupada';
            else if (mov.id_mov === 3 && estado !== 'Ocupada') estado = 'Reservada';
          }
        });
      }

      const estadoBadge = {
        'Ocupada': '<span class="badge bg-danger">Ocupada</span>',
        'Reservada': '<span class="badge bg-warning text-dark">Reservada</span>',
        'Disponible': '<span class="badge bg-success">Disponible</span>'
      }[estado];

      const deshabilitada = estado !== 'Disponible' || Number(cama.desinfeccion) !== 1;

      html += `
        <tr>
          <td>${cama.sector || '-'}</td>
          <td>${cama.habitacion || '-'}</td>
          <td>${cama.nombre_cama || '-'}</td>
          <td>${estadoBadge}</td>
          <td>${desinfeccionBadge}</td>
          <td>${paciente}</td>
          <td>${genero}</td>
          <td>
            <button class="btn btn-sm btn-primary btn-asignar-paciente"
              ${deshabilitada ? 'disabled' : ''}
              data-id="${cama.id_cama}">
              Asignar paciente
            </button>
          </td>
        </tr>
      `;
    });
  }

  html += `</tbody></table>`;
  $('#tablaCamasContainer').html(html);

  $('#tablaCamas').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    paging: true,
    pageLength: 10,
    searching: true,
    ordering: true,
    destroy: true,
  });
}


$(document).ready(function () {
  configurarBusquedaDeCamas(buscarCamasDisponibles);
});
