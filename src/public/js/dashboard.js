import { configurarBusquedaDeCamas } from './utils/validacionFechas.js';

function buscarCamasDisponibles(fecha) {
	$('#tablaCamasContainer').html(
		'<div class="text-center my-4"><div class="spinner-border"></div> Cargando...</div>'
	);
	fetch(`/api/camas/disponibles?fecha=${fecha}`)
		.then((res) => res.json())
		.then((camas) => {
			renderTablaCamas(camas);
		})
		.catch(() => {
			$('#tablaCamasContainer').html(
				'<div class="alert alert-danger">Error al cargar las camas.</div>'
			);
	});
}
	
function renderTablaCamas(camas) {
  const inputFecha = $('#fecha_busqueda').val();
  const fechaSeleccionada = new Date(`${inputFecha}T00:00:00`);

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

      let esReservaEnFecha = false;

      if (Array.isArray(cama.movimientos)) {
        const fechaSeleccionadaStr = fechaSeleccionada.toISOString().slice(0, 10);
        esReservaEnFecha = cama.movimientos.some(mov => {
          if (mov.id_mov === 3 && mov.fecha_hora_ingreso) {
            const ingresoStr = mov.fecha_hora_ingreso.slice(0, 10);
            const egresoStr = mov.fecha_hora_egreso ? mov.fecha_hora_egreso.slice(0, 10) : null;
            return ingresoStr <= fechaSeleccionadaStr && (!egresoStr || egresoStr >= fechaSeleccionadaStr);
          }
          return false;
        });
      }


      let estadoBadge = '';
      if (esReservaEnFecha) {
        estadoBadge = '<span class="badge bg-warning text-dark">Reservada</span>';
      } else if (cama.estado === 1 || cama.estado === true || cama.estado === 'Ocupada') {
        estadoBadge = '<span class="badge bg-danger">Ocupada</span>';
      } else {
        estadoBadge = '<span class="badge bg-success">Disponible</span>';
      }


      const deshabilitada = (
        cama.estado === 1 || cama.estado === true || cama.estado === 'Ocupada'
      ) || Number(cama.desinfeccion) !== 1 || esReservaEnFecha;

      html += `
        <tr>
          <td>${cama.sector || '-'}</td>
          <td>${cama.habitacion || '-'}</td>
          <td>${cama.nombre_cama || '-'}</td>
          <td>${estadoBadge}</td>
          <td>${desinfeccionBadge}</td>
          <td>${cama.paciente || '-'}</td>
          <td>${cama.genero || '-'}</td>
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



