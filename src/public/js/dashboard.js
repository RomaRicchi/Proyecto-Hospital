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
  const fechaSeleccionada = new Date($('#fecha_busqueda').val());
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

      // Detectar si hay una reserva activa para la fecha seleccionada
      let esReservaEnFecha = false;
      if (Array.isArray(cama.movimientos)) {
        esReservaEnFecha = cama.movimientos.some(mov => {
          if (mov.id_mov === 3 && mov.fecha_hora_ingreso && mov.fecha_hora_egreso) {
            const inicio = new Date(mov.fecha_hora_ingreso);
            const fin = new Date(mov.fecha_hora_egreso);
            return fechaSeleccionada >= inicio && fechaSeleccionada <= fin;
          }
          return false;
        });
      }

      // Determinar el estado visual
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



