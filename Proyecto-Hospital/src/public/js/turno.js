import { formatDate, formatHour } from './utils/validacionFechas.js';
import { mostrarFormulario } from './utils/formTurno.js';

$(document).ready(function () {
  const isMedico = window.usuario?.rol === 4;
  const idMedico = window.usuario?.id_personal_salud;

  if (isMedico) {
    $('#filtroProfesionalTurno').closest('.row').hide();
  }

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
  
  if (isMedico) {
    $('#filtroProfesionalTurno').closest('.row').hide();
    $('#btnNuevoTurno').hide(); 
  }
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
      confirmButtonText: 'Eliminar',
      customClass: {
        popup: 'swal2-card-style'
      },
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

  function renderTurnos(tabla, turnos) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    tabla.clear();

    turnos
      .filter(t => {
        const fecha = new Date(t.fecha_hora);
        return !isNaN(fecha) && fecha >= hoy;
      })
      .filter(t => {
        if (isMedico) {
          return t.agenda?.personal?.id_personal_salud == idMedico;
        }
        const filtroId = $('#filtroProfesionalTurno').val();
        return !filtroId || t.agenda?.personal?.id_personal_salud == filtroId;
      })
      .forEach(t => {
        const paciente = t.cliente
          ? `${t.cliente.apellido_p}, ${t.cliente.nombre_p} (${t.cliente.dni_paciente || '-'})`
          : '-';
        const obraSocial = t.obra_social?.nombre || 'Sin OS';
        const profesional = t.agenda?.personal
          ? `${t.agenda.personal.apellido}, ${t.agenda.personal.nombre} (${t.agenda.personal?.especialidad?.nombre || '-'})`
          : '-';
        const fecha = t.fecha_hora ? formatDate(t.fecha_hora) : '-';
        const hora = t.fecha_hora ? formatHour(t.fecha_hora) : '-';
        const estado = t.estado_turno?.nombre || '-';
        const motivo = t.motivo_turno?.tipo || '-';

        tabla.row.add([
          paciente,
          obraSocial,
          profesional,
          fecha,
          hora,
          estado,
          motivo,
          isMedico
            ? `<button class="btn btn-sm btn-success btn-atender-turno" data-id="${t.id_turno}" data-dni="${t.cliente?.dni_paciente}">
                Atender
              </button>`
            : `<button class="btn btn-sm btn-primary editar" title="Editar" data-id="${t.id_turno}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger eliminar" title="Eliminar" data-id="${t.id_turno}">
                <i class="fas fa-trash-alt"></i>
              </button>`
        ]);
      });

    tabla.draw();
  }
  let url = '/api/turnos/listado';
  if (window.usuario?.rol === 4) {
    url += `?medico=${window.usuario.id_personal_salud}`;
  }

  function cargarTurnos() {
    fetch(url)
      .then(res => res.json())
      .then(turnos => {
        renderTurnos(tabla, turnos);
      })
      .catch(err => {
        console.error('❌ Error al cargar los turnos:', err.message);
        Swal.fire('Error', 'No se pudieron cargar los turnos', 'error');
      });
  }

  $(document).on('click', '.btn-atender-turno', function () {
    const dni = $(this).data('dni');
    if (dni) {
      window.location.href = `/registroClinico?dni=${dni}`;
    }
  });

  function configurarFiltroProfesional() {
    const select = $('#filtroProfesionalTurno');

    if (isMedico) {
      // Mostrar el select solo con el médico logueado
      const nombreCompleto = `${window.usuario.apellido}, ${window.usuario.nombre}`;
      select.html(`<option value="${idMedico}" selected>${nombreCompleto}</option>`);
      select.prop('disabled', true);
      cargarTurnos();
      return;
    }

    // Resto de la lógica para admins
    fetch('/api/agenda')
      .then(r => r.json())
      .then(agendas => {
        const profesionalesUnicos = [];
        const seen = new Set();

        for (const a of agendas) {
          const p = a.personal;
          const key = `${p.id_personal_salud}`;
          if (!seen.has(key)) {
            seen.add(key);
            profesionalesUnicos.push({
              id: p.id_personal_salud,
              nombre: `${p.apellido}, ${p.nombre} (${p.especialidad?.nombre || '-'})`
            });
          }
        }

        const options = profesionalesUnicos.map(p =>
          `<option value="${p.id}">${p.nombre}</option>`
        );
        select.html(`<option value="">Todos los profesionales</option>${options.join('')}`);

        const guardado = localStorage.getItem('filtroProfesionalTurnoId');
        if (guardado) {
          select.val(guardado).trigger('change');
        }

        select.select2({
          placeholder: 'Filtrar por profesional',
          width: 'resolve',
          allowClear: true
        });

        select.on('change', function () {
          const valor = $(this).val();
          if (valor) {
            localStorage.setItem('filtroProfesionalTurnoId', valor);
          } else {
            localStorage.removeItem('filtroProfesionalTurnoId');
          }
          cargarTurnos();
        });

        cargarTurnos();
      });
  }


  configurarFiltroProfesional();
});
