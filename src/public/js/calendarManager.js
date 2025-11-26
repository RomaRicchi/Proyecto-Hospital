import { mostrarFormulario } from './utils/formTurno.js';

const calendarEl = document.getElementById('calendar');

if (calendarEl) {
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'es',
    height: 'auto',
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },

    events: function (fetchInfo, successCallback, failureCallback) {
      const isMedico = window.usuario?.rol === 4;
      const profesionalId = isMedico ? null : $('#filtroProfesional').val();
      
      if (isMedico) {
        $('#filtroProfesional').hide();
        $('label[for="filtroProfesional"]').hide(); 
      }
      const url = profesionalId
        ? `/api/calendario/eventos?profesionalId=${profesionalId}`
        : `/api/calendario/eventos`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          const eventosAgendas = data.filter(e => e.display === 'background');
          const eventosTurnos = data.filter(e => !e.display).map(ev => ({
            ...ev,
            color: '#ffe0b3',
            textColor: '#000000'
          }));
          successCallback([...eventosAgendas, ...eventosTurnos]);
        })
        .catch(failureCallback);
    },

    selectable: true,
    dateClick: async function (info) {
      const isMedico = window.usuario?.rol === 4;
      if (isMedico) return;

      const profesionalId = $('#filtroProfesional').val();
      if (!profesionalId) {
        Swal.fire('Primero seleccioná un profesional', '', 'warning');
        return;
      }

      const fechaHoraLocal = new Date(info.date);
      const diaJs = fechaHoraLocal.getDay();
      const diaSQL = diaJs === 0 ? 7 : diaJs;

      try {
        const agendas = await fetch('/api/agenda').then(r => r.json());

        const agenda = agendas.find(
          a => a.id_personal_salud == profesionalId && a.dia?.id_dia == diaSQL
        );

        if (!agenda) {
          Swal.fire('El profesional no tiene agenda ese día', '', 'warning');
          return;
        }

        const fechaUTC = new Date(
          fechaHoraLocal.getTime() - fechaHoraLocal.getTimezoneOffset() * 60000
        ).toISOString();

        const turnoPrellenado = {
          id_agenda: agenda.id_agenda,
          fecha_hora: fechaUTC,
          id_estado: 1,
          id_motivo: 12
        };

        mostrarFormulario(turnoPrellenado, () => {
          calendar.refetchEvents();
        });
      } catch (err) {
        console.error('Error cargando agendas:', err);
        Swal.fire('Error', 'No se pudo cargar la agenda', 'error');
      }
    },

    eventClick: function (info) {
      const evento = info.event;
      const idTurno = evento.id;
      const isMedico = window.usuario?.rol === 4;

      Swal.fire({
        title: 'Detalle del turno',
        html: `
          <div class="text-start">
            <strong>Profesional:</strong> ${evento.title}<br>
            <strong>Paciente:</strong> ${evento.extendedProps.paciente || 'Sin asignar'}<br>
            <strong>Estado:</strong> ${evento.extendedProps.estado || '---'}<br>
            <strong>Hora:</strong> ${evento.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${evento.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br><br>
            <div class="d-flex justify-content-end gap-2">
              <button id="btnEditarTurno" title="Editar" class="btn btn-outline-primary btn-sm">
                <i class="fas fa-edit"></i>
              </button>
              <button id="btnEliminarTurno" title="Eliminar" class="btn btn-outline-danger btn-sm">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        `,
        customClass: {
          popup: 'swal2-card-style'
        },
        showConfirmButton: false,
        showCancelButton: false,
        didOpen: () => {
          document.getElementById('btnEditarTurno')?.addEventListener('click', async () => {
            try {
              const turno = await fetch(`/api/turnos/${idTurno}`).then(r => r.json());
              mostrarFormulario(turno, () => calendar.refetchEvents());
              Swal.close();
            } catch {
              Swal.fire('Error', 'No se pudo cargar el turno', 'error');
            }
          });

          document.getElementById('btnEliminarTurno')?.addEventListener('click', () => {
            Swal.fire({
              title: '¿Eliminar turno?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Eliminar'
            }).then(result => {
              if (result.isConfirmed) {
                fetch(`/api/turnos/${idTurno}`, { method: 'DELETE' })
                  .then(() => {
                    Swal.fire('Turno eliminado', '', 'success');
                    calendar.refetchEvents();
                  })
                  .catch(() => Swal.fire('Error al eliminar turno', '', 'error'));
              }
            });
          });
        }
      });
    }
  });

  calendar.render();
  fetch('/api/personal-salud')
  .then(res => res.json())
  .then(profesionales => {
    const opciones = profesionales.map(p => `
      <option value="${p.id_personal_salud}">
        ${p.apellido}, ${p.nombre} (${p.especialidad?.nombre || '-'})
      </option>`).join('');
    $('#filtroProfesional').append(opciones);
  });
  $('#filtroProfesional').on('change', () => {
    calendar.refetchEvents();
  });


}
