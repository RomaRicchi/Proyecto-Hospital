$(document).ready(function () {
  const tabla = $('#tablaAgendas').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    columns: [
      null, null, null, null, null,
      { orderable: false }
    ]
  });

  function cargarAgendas() {
    fetch('/api/agendas')
      .then(res => res.json())
      .then(agendas => {
        tabla.clear();
        agendas.forEach(a => {
          tabla.row.add([
            a.profesional?.username || '-',
            a.dia?.nombre || '-',
            a.hora_inicio,
            a.hora_fin,
            a.duracion_minutos + ' min',
            `
            <button class="btn btn-sm btn-primary editar" data-id="${a.id_agenda}">Editar</button>
            <button class="btn btn-sm btn-danger eliminar" data-id="${a.id_agenda}">Eliminar</button>
            `
          ]);
        });
        tabla.draw();
      });
  }

  cargarAgendas();

  $('#btnNuevaAgenda').on('click', () => mostrarFormulario());

  function mostrarFormulario(agenda = {}) {
    Swal.fire({
      title: agenda.id_agenda ? 'Editar Agenda' : 'Nueva Agenda',
      html: `
        <input id="usuario" class="swal2-input" placeholder="ID Profesional" value="${agenda.id_usuario || ''}">
        <input id="dia" class="swal2-input" placeholder="ID Día Semana" value="${agenda.id_dia_semana || ''}">
        <input id="inicio" type="time" class="swal2-input" value="${agenda.hora_inicio || ''}">
        <input id="fin" type="time" class="swal2-input" value="${agenda.hora_fin || ''}">
        <input id="duracion" type="number" class="swal2-input" placeholder="Duración (min)" value="${agenda.duracion_minutos || ''}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => ({
        id_usuario: $('#usuario').val(),
        id_dia_semana: $('#dia').val(),
        hora_inicio: $('#inicio').val(),
        hora_fin: $('#fin').val(),
        duracion_minutos: $('#duracion').val(),
      })
    }).then(result => {
      if (!result.isConfirmed) return;

      const metodo = agenda.id_agenda ? 'PUT' : 'POST';
      const url = agenda.id_agenda ? `/api/agendas/${agenda.id_agenda}` : '/api/agendas';

      fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      })
        .then(() => {
          Swal.fire('Éxito', 'Agenda guardada', 'success');
          cargarAgendas();
        })
        .catch(() => Swal.fire('Error', 'No se pudo guardar', 'error'));
    });
  }

  $(document).on('click', '.editar', async function () {
    const id = $(this).data('id');
    const agenda = await fetch(`/api/agendas/${id}`).then(r => r.json());
    mostrarFormulario(agenda);
  });

  $(document).on('click', '.eliminar', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar agenda?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`/api/agendas/${id}`, { method: 'DELETE' })
          .then(() => {
            Swal.fire('Eliminada', '', 'success');
            cargarAgendas();
          });
      }
    });
  });
});
