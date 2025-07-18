import { formatDate, formatHour } from './utils/validacionFechas.js';
import { mostrarFormulario } from './utils/formTurno.js';

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

  configurarFiltroProfesional();
  cargarTurnos();

  $('#btnNuevoTurno').on('click', () => mostrarFormulario(null, cargarTurnos));

  $(document).on('click', '.editar', async function () {
    const id = $(this).data('id');
    const turno = await fetch(`/api/turnos/${id}`).then(r => r.json());
    mostrarFormulario(turno, cargarTurnos);
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

  function renderTurnos(tabla, turnos, filtroId) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const isMedico = window.usuario?.rol === 'medico';
    tabla.clear();
    turnos
      .filter(t => {
        const fecha = new Date(t.fecha_hora);
        return !isNaN(fecha) && fecha >= hoy;
      })
      .filter(t => !filtroId || t.id_agenda == filtroId)
      .forEach(t => {
        const paciente = t.cliente ? `${t.cliente.apellido_p}, ${t.cliente.nombre_p}` : '-';
        const profesional = t.agenda?.personal
          ? `${t.agenda.personal.apellido}, ${t.agenda.personal.nombre} (${t.agenda.personal?.especialidad?.nombre || '-'})`
          : '-';
        const fecha = t.fecha_hora ? formatDate(t.fecha_hora) : '-';
        const hora = t.fecha_hora ? formatHour(t.fecha_hora) : '-';
        const estado = t.estado_turno?.nombre || '-';
        const motivo = t.motivo_turno?.tipo || '-';

        tabla.row.add([
          paciente,
          profesional,
          fecha,
          hora,
          estado,
          motivo,
          isMedico
            ? `<button class="btn btn-sm btn-success btn-atender-turno" data-id="${t.id_turno}" data-id-paciente="${t.id_paciente}">
                  Atender
              </button>`
            : `<button class="btn btn-sm btn-primary editar" data-id="${t.id_turno}">Editar</button>
              <button class="btn btn-sm btn-danger eliminar" data-id="${t.id_turno}">Eliminar</button>`
        ]);
      });

    tabla.draw();
  }

  function cargarTurnos() {
    fetch('/api/turnos/listado')
      .then(res => res.json())
      .then(turnos => {
        const filtro = $('#filtroProfesionalTurno').val();
        renderTurnos(tabla, turnos, filtro);
      })
      .catch(err => {
        console.error('❌ Error al cargar los turnos:', err.message);
        Swal.fire('Error', 'No se pudieron cargar los turnos', 'error');
      });
  }

  $(document).on('click', '.btn-atender-turno', function () {
    const idPaciente = $(this).data('id-paciente');
    if (idPaciente) {
      window.location.href = `/registro-clinico/${idPaciente}`;
    }
  });

  function configurarFiltroProfesional() {
    const guardado = localStorage.getItem('filtroProfesionalTurnoId');

    $('#filtroProfesionalTurno').select2({
      placeholder: 'Filtrar por profesional o especialidad',
      ajax: {
        url: '/api/agenda/buscar',
        dataType: 'json',
        delay: 250,
        data: params => ({ q: params.term }),
        processResults: data => ({
          results: data.map(d => ({
            id: d.id,
            text: d.text || `${d.personal?.apellido}, ${d.personal?.nombre} (${d.personal?.especialidad?.nombre || ''})`
          }))
        }),
        cache: true
      },
      width: 'resolve',
      allowClear: true
    });

    if (guardado) {
      fetch(`/api/agenda/buscar?q=${guardado}`)
        .then(r => r.json())
        .then(data => {
          const encontrado = data.find(p => p.id == guardado);
          if (encontrado) {
            const op = new Option(encontrado.text, encontrado.id, true, true);
            $('#filtroProfesionalTurno').append(op).trigger('change.select2');
          }
          cargarTurnos();
        })
        .catch(() => cargarTurnos());
    } else {
      cargarTurnos();
    }

    $('#filtroProfesionalTurno').on('change', function () {
      localStorage.setItem('filtroProfesionalTurnoId', $(this).val());
      cargarTurnos();
    });
  }
});
