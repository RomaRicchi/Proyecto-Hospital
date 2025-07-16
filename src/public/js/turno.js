import { formatDate, formatHour } from './utils/validacionFechas.js';

$(document).ready(function () {
  const tabla = $('#tablaTurnos').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    paging: true,
    pageLength: 10,
    searching: true,
    ordering: true,
    responsive: true,
    scrollX: false,
    columnDefs: [{ targets: [6], orderable: false, searchable: false }], 
  });
  

  function cargarTurnos() {
    fetch('/api/turnos/listado')
      .then(res => {
        if (!res.ok) throw new Error('Error en la carga de turnos');
        return res.json();
      })
      .then(turnos => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); 
        if (!Array.isArray(turnos)) {
          throw new Error('La respuesta no es una lista válida de turnos');
        }

        tabla.clear();
        turnos
        .filter(t => new Date(t.fecha_hora) >= hoy)
        .forEach(t => {
          tabla.row.add([
            `${t.cliente?.apellido_p || ''}, ${t.cliente?.nombre_p || ''}`,
            t.agenda?.personal
              ? `${t.agenda.personal.apellido}, ${t.agenda.personal.nombre} (${t.agenda.personal?.especialidad?.nombre || ''})`
              : '-',
            t.fecha_hora ? formatDate(t.fecha_hora) : '-',
            t.fecha_hora ? formatHour(t.fecha_hora) : '-',
            t.estado_turno?.nombre || '-',
            t.motivo_turno?.tipo || '-',
            `
              <button class="btn btn-sm btn-primary editar" data-id="${t.id_turno}">Editar</button>
              <button class="btn btn-sm btn-danger eliminar" data-id="${t.id_turno}">Eliminar</button>
            `
          ]);
        });
        tabla.draw();
      })
      .catch(err => {
        console.error('❌ Error al cargar los turnos:', err.message);
        Swal.fire('Error', 'No se pudieron cargar los turnos', 'error');
      });
  }

  $('#btnNuevoTurno').on('click', () => mostrarFormulario());

  async function mostrarFormulario(turno = {}) {
    const [pacientes, agendas, estados, motivos] = await Promise.all([
      fetch('/api/pacientes').then(r => r.json()),
      fetch('/api/agenda').then(r => r.json()),
      fetch('/api/estadoTurno').then(r => r.json()),
      fetch('/api/motivos_ingreso').then(r => r.json())
    ]);

    const pacienteOptions = pacientes.map(p =>
      `<option value="${p.id_paciente}" ${turno.id_paciente === p.id_paciente ? 'selected' : ''}>
        ${p.apellido_p}, ${p.nombre_p}
      </option>`
    ).join('');

    const agendaOptions = agendas.map(a => {
      const prof = a.personal;
      const nombreCompleto = prof
        ? `${prof.apellido}, ${prof.nombre} (${prof.especialidad?.nombre || '-'})`
        : `Agenda #${a.id_agenda}`;
      return `<option value="${a.id_agenda}" ${turno.id_agenda === a.id_agenda ? 'selected' : ''}>
        ${nombreCompleto}
      </option>`;
    }).join('');

    const estadoOptions = estados.map(e =>
      `<option value="${e.id_estado}" ${turno.id_estado === e.id_estado ? 'selected' : ''}>
        ${e.nombre}
      </option>`
    ).join('');

    const motivoOptions = motivos.map(m =>
      `<option value="${m.id_motivo}" ${turno.id_motivo === m.id_motivo ? 'selected' : ''}>
        ${m.tipo}
      </option>`
    ).join('');

    Swal.fire({
      title: turno.id_turno ? 'Editar Turno' : 'Nuevo Turno',
      html: `
        <select id="id_paciente" class="swal2-input select-paciente" style="width:100%">
          ${pacienteOptions}
        </select>
        <select id="id_agenda" class="swal2-input">${agendaOptions}</select>
        <input id="fecha_turno" type="date" class="swal2-input" value="${turno.fecha_hora ? formatDate(turno.fecha_hora) : ''}">
        <input id="hora_turno" type="time" class="swal2-input" value="${turno.fecha_hora ? formatHour(turno.fecha_hora) : ''}">
          ${turno.id_turno ? `
        <select id="id_estado" class="swal2-input">${estadoOptions}</select>
          ` : ''}
        <select id="id_motivo" class="swal2-input">${motivoOptions}</select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      didOpen: () => {
        Swal.getPopup().querySelector('.select-paciente')?.classList.remove('swal2-input');
        $('#id_paciente').select2({
          dropdownParent: $('.swal2-popup'),
          placeholder: 'Buscar por DNI o nombre...',
          minimumInputLength: 2,
          ajax: {
            url: '/api/pacientes/buscar',
            dataType: 'json',
            delay: 250,
            data: params => ({ q: params.term }),
            processResults: data => ({ results: data })
          },
          width: '100%'
        });
      },
      preConfirm: () => {
        const id_paciente = parseInt($('#id_paciente').val());
        const id_agenda = parseInt($('#id_agenda').val());
        const fecha_turno = $('#fecha_turno').val();
        const hora_turno = $('#hora_turno').val();
        const id_motivo = parseInt($('#id_motivo').val());
        const id_estado = turno.id_turno ? parseInt($('#id_estado').val()) : 1;

        // Validar campos obligatorios
        if (!id_paciente || !id_agenda || !fecha_turno || !hora_turno || !id_motivo) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        // Validar que la fecha y hora del turno sean futuras
        const fechaHora = new Date(`${fecha_turno}T${hora_turno}`);
        if (isNaN(fechaHora.getTime()) || fechaHora < new Date()) {
          Swal.showValidationMessage('La fecha y hora del turno deben ser futuras');
          return false;
        }

        return {
          id_paciente,
          id_agenda,
          fecha_turno,
          hora_turno,
          id_estado,
          id_motivo
        };
      }
    }).then(result => {
      if (!result.isConfirmed) return;

      const metodo = turno.id_turno ? 'PUT' : 'POST';
      const url = turno.id_turno ? `/api/turnos/${turno.id_turno}` : '/api/turnos';

      fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      }).then(() => {
        Swal.fire('Éxito', 'Turno guardado', 'success');
        cargarTurnos();
      }).catch(() => Swal.fire('Error', 'No se pudo guardar', 'error'));
    });
  }

  $(document).on('click', '.editar', async function () {
    const id = $(this).data('id');
    const turno = await fetch(`/api/turnos/${id}`).then(r => r.json());
    mostrarFormulario(turno);
  });

  $(document).on('click', '.eliminar', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar turno?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`/api/turnos/${id}`, { method: 'DELETE' })
          .then(() => {
            Swal.fire('Eliminado', '', 'success');
            cargarTurnos();
          });
      }
    });
  });
  cargarTurnos();
});
