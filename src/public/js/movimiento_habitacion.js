import { toUTC } from './utils/validacionFechas.js';

$(document).ready(function () {
  const hoyLocal = new Date();
  const offset = hoyLocal.getTimezoneOffset();
  hoyLocal.setMinutes(hoyLocal.getMinutes() - offset);
  const hoy = hoyLocal.toISOString().split('T')[0];

  $('#fecha_ingreso').attr('min', hoy);

  const tabla = $('#tablaMovimientosHabitacion');

  if (tabla.length) {
    fetch('/api/movimientos_habitacion')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then((movimientos) => {
        const dataSet = (movimientos || []).map((m) => {
          const rol = window.usuario?.rol;
          const id = m.id_movimiento;

          let acciones = '';
			const esIngresoActivo = Number(m.id_mov) === 1 && Number(m.estado) === 1;

			if (rol === 3 && esIngresoActivo) {
			acciones += `
				<button class="btn btn-sm btn-warning trasladar-btn" data-id="${id}">
				<i class="fas fa-exchange-alt"></i> Trasladar
				</button>`;
			} else if (rol !== 3) {
			acciones += `
				<button class="btn btn-sm btn-primary edit-btn" data-id="${id}">
				<i class="fas fa-pen"></i>
				</button>
				<button class="btn btn-sm btn-danger delete-btn" data-id="${id}">
				<i class="fas fa-trash"></i>
				</button>`;
			}

          return [
            m.admision?.paciente
              ? `${m.admision.paciente.apellido_p}, ${m.admision.paciente.nombre_p}`
              : '-',
            m.habitacion?.num || '-',
            m.habitacion?.sector?.nombre || '-',
            m.cama?.nombre || m.id_cama || '-',
            m.tipo_movimiento?.nombre || '-',
            m.fecha_hora_ingreso
              ? new Date(m.fecha_hora_ingreso).toLocaleString('es-AR')
              : '-',
            m.fecha_hora_egreso
              ? new Date(m.fecha_hora_egreso).toLocaleString('es-AR')
              : '-',
            Number(m.estado) === 1 ? 'Activo' : 'Inactivo',
            acciones,
          ];
        });

        tabla.DataTable({
          data: dataSet,
          columns: [
            { title: 'Paciente' },
            { title: 'Habitación' },
            { title: 'Sector' },
            { title: 'Cama' },
            { title: 'Tipo Movimiento' },
            { title: 'Fecha Ingreso' },
            { title: 'Fecha Egreso' },
            { title: 'Estado' },
            { title: 'Acciones' },
          ],
          language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
          },
          paging: true,
          pageLength: 10,
          searching: true,
          ordering: true,
          responsive: true,
          scrollX: false,
          columnDefs: [{ targets: [6], orderable: false, searchable: false }],
        });
      })
      .catch(() => {
        $('#tablaMovimientosHabitacion').html(
          '<tr><td colspan="10" class="text-center">No se pudo cargar los movimientos habitación.</td></tr>'
        );
      });
    }

    $('#tablaMovimientosHabitacion tbody').on('click', '.edit-btn', function () {
  const id = $(this).data('id');
  fetch(`/api/movimientos_habitacion/${id}`)
    .then((res) => res.json())
    .then((m) => {
      const ingresoLocal = m.fecha_hora_ingreso
        ? new Date(m.fecha_hora_ingreso).toISOString().slice(0, 16)
        : '';
      const egresoLocal = m.fecha_hora_egreso
        ? new Date(m.fecha_hora_egreso).toISOString().slice(0, 16)
        : '';

     Swal.fire({
		title: 'Editar Movimiento',
		html: `
			<input type="hidden" id="id_admision" value="${m.id_admision}">
			<p class="swal2-input"><b>Sector:</b> ${m.habitacion?.sector?.nombre || '-'}</p>
			<p class="swal2-input"><b>Habitación:</b> ${m.habitacion?.num || '-'}</p>
			<p class="swal2-input"><b>Cama:</b> ${m.cama?.nombre || '-'}</p>
			<input type="hidden" id="id_habitacion" value="${m.id_habitacion}">
			<input type="hidden" id="id_cama" value="${m.id_cama}">
			<input type="datetime-local" id="fecha_hora_ingreso" class="swal2-input" value="${ingresoLocal}">
			<input type="datetime-local" id="fecha_hora_egreso" class="swal2-input" value="${egresoLocal}">
			<select id="id_mov" class="swal2-select">
			<option value="1" ${m.id_mov == 1 ? 'selected' : ''}>Ingresa/Ocupa</option>
			<option value="4" ${m.id_mov == 4 ? 'selected' : ''}>Traslado</option>
			</select>
			<select id="estado" class="swal2-select">
			<option value="1" ${m.estado == 1 ? 'selected' : ''}>Activo</option>
			<option value="0" ${m.estado == 0 ? 'selected' : ''}>Inactivo</option>
			</select>
		`,
		customClass: {
			popup: 'swal2-card-style',
		},
		preConfirm: () => {
			const id_admision = $('#id_admision').val();
			const id_habitacion = $('#id_habitacion').val();
			const id_cama = $('#id_cama').val();
			const fecha_hora_ingreso = $('#fecha_hora_ingreso').val();
			const fecha_hora_egreso = $('#fecha_hora_egreso').val();
			const id_mov = $('#id_mov').val();
			const estado = $('#estado').val();

			if (!id_admision || !id_habitacion || !id_cama || !fecha_hora_ingreso || !id_mov) {
			Swal.showValidationMessage('Por favor, completa todos los campos obligatorios');
			return false;
			}

			const ingresoUTC = toUTC(fecha_hora_ingreso);
			const hoy = new Date();
			hoy.setUTCHours(0, 0, 0, 0);

			if (new Date(ingresoUTC) < hoy) {
			Swal.showValidationMessage('La fecha de ingreso no puede ser anterior a hoy.');
			return false;
			}

			return {
			id_admision,
			id_habitacion,
			id_cama,
			fecha_hora_ingreso: ingresoUTC,
			fecha_hora_egreso: fecha_hora_egreso ? toUTC(fecha_hora_egreso) : null,
			id_mov,
			estado,
			};
		},
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`/api/movimientos_habitacion/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value),
          })
            .then(() => Swal.fire('Actualizado', 'Movimiento modificado', 'success').then(() => location.reload()))
            .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
        }
      });
    });
	});

  	$('#tablaMovimientosHabitacion tbody').on('click', '.trasladar-btn', async function () {
	const id = $(this).data('id');

	// Traer movimiento actual
	const resp = await fetch(`/api/movimientos_habitacion/${id}`);
	const movimiento = await resp.json();
	const generoPaciente = movimiento?.admision?.paciente?.genero?.nombre;

	if (!generoPaciente) {
		return Swal.fire('Error', 'No se pudo determinar el género del paciente', 'error');
	}

	const camaActual = movimiento?.cama?.id_cama;

	// Traer sectores
	const sectoresResp = await fetch('/api/sectores');
	const sectores = await sectoresResp.json();

	// Traer camas disponibles del día
	const hoy = new Date().toISOString().split('T')[0];
	const camasResp = await fetch(`/api/camas/disponibles?fecha=${hoy}`);
	const camas = await camasResp.json();

	// Formulario
	const htmlForm = `
		<select id="selectSector" class="swal2-select">
		<option value="">Seleccione un sector</option>
		${sectores.map(s => `<option value="${s.nombre}">${s.nombre}</option>`).join('')}
		</select>
		<select id="selectDestino" class="swal2-select" disabled>
		<option value="">Seleccione habitación y cama</option>
		</select>
	`;

	const { value: traslado } = await Swal.fire({
		title: 'Trasladar Paciente',
		html: htmlForm,
		didOpen: () => {
		const $sector = $('#selectSector');
		const $destino = $('#selectDestino');

		$sector.on('change', function () {
			const sectorElegido = $(this).val();
			if (!sectorElegido) {
			$destino.prop('disabled', true).html('<option value="">Seleccione habitación y cama</option>');
			return;
			}

			const compatibles = camas.filter(c =>
			c.sector === sectorElegido &&
			c.estado === 'Disponible' &&
			c.id_cama !== camaActual
			);

			if (!compatibles.length) {
			$destino.prop('disabled', true).html('<option value="">Sin camas disponibles</option>');
			return;
			}

			const options = compatibles.map(c =>
			`<option value="${c.id_cama}" data-hab="${c.habitacion}">Hab. ${c.habitacion} - Cama ${c.nombre_cama}</option>`
			).join('');

			$destino.prop('disabled', false).html(`<option value="">Seleccione habitación y cama</option>${options}`);
		});
		},
		preConfirm: () => {
		const $cama = $('#selectDestino');
		const id_cama = $cama.val();
		const id_habitacion = $cama.find(':selected').data('hab');

		if (!id_cama || !id_habitacion) {
			Swal.showValidationMessage('Debe seleccionar habitación y cama');
			return false;
		}

		return { id_habitacion, id_cama };
		},
		customClass: { popup: 'swal2-card-style' },
		showCancelButton: true
	});

	if (traslado) {
		try {
		await fetch(`/api/movimientos_habitacion/${id}/traslado`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(traslado),
		});

		Swal.fire('Traslado realizado', '', 'success').then(() => location.reload());
		} catch (err) {
		Swal.fire('Error', 'No se pudo realizar el traslado', 'error');
		}
	}
	});

	$('#tablaMovimientosHabitacion tbody').on('click', '.delete-btn', function () {
	const id = $(this).data('id');

	Swal.fire({
		title: '¿Eliminar movimiento?',
		text: 'Esta acción eliminará el movimiento permanentemente.',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Sí, eliminar',
		cancelButtonText: 'Cancelar',
		customClass: {
		popup: 'swal2-card-style',
		},
	}).then((result) => {
		if (result.isConfirmed) {
		fetch(`/api/movimientos_habitacion/${id}`, { method: 'DELETE' })
			.then((res) => {
			if (!res.ok) throw new Error();
			return Swal.fire('Eliminado', 'Movimiento eliminado', 'success').then(() => location.reload());
			})
			.catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
		}
	});
	});

});
