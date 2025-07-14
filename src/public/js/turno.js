$(document).ready(function () {
  const tabla = $('#tablaTurnos').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    columns: [null, null, null, null, null, { orderable: false }]
  });

  function cargarTurnos() {
    fetch('/api/turnos')
      .then(res => res.json())
      .then(turnos => {
        tabla.clear();
        turnos.forEach(t => {
          tabla.row.add([
            `${t.paciente?.apellido_p || ''}, ${t.paciente?.nombre_p || ''}`,
            t.agenda ? `Agenda #${t.agenda.id_agenda}` : '-',
            t.fecha_turno || '-',
            t.hora_turno || '-',
            t.estado?.nombre || '-',
            `
              <button class="btn btn-sm btn-primary editar" data-id="${t.id_turno}">Editar</button>
              <button class="btn btn-sm btn-danger eliminar" data-id="${t.id_turno}">Eliminar</button>
            `
          ]);
        });
        tabla.draw();
      });
  }

  cargarTurnos();

  $('#btnNuevoTurno').on('click', () => mostrarFormulario());

  function mostrarFormulario(turno = {}) {
    Swal.fire({
      title: turno.id_turno ? 'Editar Turno' : 'Nuevo Turno',
      html: `
        <input id="id_paciente" class="swal2-input" placeholder="ID Paciente" value="${turno.id_paciente || ''}">
        <input id="id_agenda" class="swal2-input" placeholder="ID Agenda" value="${turno.id_agenda || ''}">
        <input id="fecha_turno" type="date" class="swal2-input" value="${turno.fecha_turno || ''}">
        <input id="hora_turno" type="time" class="swal2-input" value="${turno.hora_turno || ''}">
        <input id="id_estado" class="swal2-input" placeholder="ID Estado" value="${turno.id_estado || ''}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => ({
        id_paciente: $('#id_paciente').val(),
        id_agenda: $('#id_agenda').val(),
        fecha_turno: $('#fecha_turno').val(),
        hora_turno: $('#hora_turno').val(),
        id_estado: $('#id_estado').val(),
      })
    }).then(result => {
      if (!result.isConfirmed) return;

      const metodo = turno.id_turno ? 'PUT' : 'POST';
      const url = turno.id_turno ? `/api/turnos/${turno.id_turno}` : '/api/turnos';

      fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      })
        .then(() => {
          Swal.fire('Éxito', 'Turno guardado', 'success');
          cargarTurnos();
        })
        .catch(() => Swal.fire('Error', 'No se pudo guardar', 'error'));
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
});
