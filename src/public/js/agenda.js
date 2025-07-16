import { mostrarFormulario } from './utils/formAgenda.js';
import { crearCalendario } from './utils/calendarManager.js';

$(document).ready(function () {
  const tabla = $('#tablaAgendas').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    columns: [null, null, null, null, null, { orderable: false }]
  });

  let calendar = null;

  function cargarAgendas() {
    const idProfesional = $('#filtroProfesional').val();

    fetch('/api/agenda')
      .then(res => res.json())
      .then(agendas => {
        tabla.clear();

        const filtradas = idProfesional
          ? agendas.filter(a => a.id_personal_salud == idProfesional)
          : agendas;

        filtradas.forEach(a => {
          const profesional = a.personal
            ? `${a.personal.apellido}, ${a.personal.nombre} (${a.personal.especialidad?.nombre || '-'})`
            : a.profesional?.username || '-';

          tabla.row.add([
            profesional,
            a.dia?.nombre || '-',
            a.hora_inicio,
            a.hora_fin,
            a.duracion + ' min',
            `
            <button class="btn btn-sm btn-primary editar" data-id="${a.id_agenda}">Editar</button>
            <button class="btn btn-sm btn-danger eliminar" data-id="${a.id_agenda}">Eliminar</button>
            `
          ]);
        });

        tabla.draw();
      })
      .catch(err => {
        console.error('❌ Error al cargar agendas:', err);
        Swal.fire('Error', 'No se pudieron cargar las agendas', 'error');
      });
  }

  $('#btnNuevaAgenda').on('click', () => mostrarFormulario());

  $(document).on('click', '.editar', async function () {
    const id = $(this).data('id');
    try {
      const agenda = await fetch(`/api/agenda/${id}`).then(r => r.json());
      mostrarFormulario(agenda);
    } catch {
      Swal.fire('Error', 'No se pudo cargar la agenda', 'error');
    }
  });

  $(document).on('click', '.eliminar', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar agenda?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`/api/agenda/${id}`, { method: 'DELETE' })
          .then(() => {
            Swal.fire('Eliminada', '', 'success');
            cargarAgendas();
          })
          .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
      }
    });
  });

  // Guardar y cargar filtro de profesional
  const filtroGuardado = localStorage.getItem('filtroProfesionalId');

  $('#filtroProfesional').select2({
    placeholder: 'Buscar por profesional o especialidad',
    ajax: {
      url: '/api/agenda/buscar',
      dataType: 'json',
      delay: 250,
      data: params => ({ q: params.term }),
      processResults: data => ({ results: data }),
      cache: true
    },
    width: 'resolve',
    allowClear: true
  });

  if (filtroGuardado) {
    fetch(`/api/agenda/buscar?q=${filtroGuardado}`)
      .then(res => res.json())
      .then(data => {
        const op = data.find(p => p.id == filtroGuardado);
        if (op) {
          const option = new Option(op.text, op.id, true, true);
          $('#filtroProfesional').append(option).trigger('change');
        }
        cargarAgendas(); // solo después de cargar el filtro
      })
      .catch(() => cargarAgendas());
  } else {
    cargarAgendas();
  }

  $('#filtroProfesional').on('change', function () {
    const valor = $(this).val();
    localStorage.setItem('filtroProfesionalId', valor);
    cargarAgendas();
    if (calendar) calendar.refetchEvents();
  });

  $('#toggleVista').on('click', function () {
    const tabla = $('#vistaTabla');
    const calendario = $('#calendar');
    const mostrandoTabla = tabla.is(':visible');

    if (mostrandoTabla) {
      tabla.hide();
      calendario.show();
      $(this).text('Ver como tabla');
      localStorage.setItem('vistaActiva', 'calendario');

      if (!calendar) {
        calendar = crearCalendario();
      } else {
        calendar.refetchEvents();
      }
    } else {
      calendario.hide();
      tabla.show();
      $(this).text('Ver como calendario');
      localStorage.setItem('vistaActiva', 'tabla');
    }
  });

  const vista = localStorage.getItem('vistaActiva') || 'tabla';
  if (vista === 'calendario') {
    $('#toggleVista').click();
  }
});
