export function crearCalendario() {
  const calendarEl = document.getElementById('calendar');

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
      const profesionalId = $('#filtroProfesional').val();

      if (!profesionalId) {
        return successCallback([]);  // Vaciar calendario
      }

      fetch(`/api/agenda/calendario/turnos?profesionalId=${profesionalId}`)
        .then(res => res.json())
        .then(successCallback)
        .catch(failureCallback);
    },

    selectable: true,
    dateClick: function (info) {
      const profesionalId = $('#filtroProfesional').val();

      if (!profesionalId) {
        Swal.fire('Primero seleccioná un profesional', '', 'warning');
        return;
      }

      const [fecha, hora] = info.dateStr.split('T');

      Swal.fire({
        title: 'Asignar nuevo turno',
        html: `
          <select id="pacienteTurno" class="swal2-select" style="width:100%"></select>
          <input type="date" id="fechaTurno" class="swal2-input" value="${fecha}">
          <input type="time" id="horaTurno" class="swal2-input" value="${hora?.slice(0, 5) || ''}">
        `,
        didOpen: () => {
          $('#pacienteTurno').select2({
            dropdownParent: $('.swal2-popup'),
            placeholder: 'Buscar paciente',
            ajax: {
              url: '/api/pacientes/buscar',
              dataType: 'json',
              delay: 250,
              data: params => ({ q: params.term }),
              processResults: data => ({ results: data }),
              cache: true
            },
            width: 'resolve'
          });
        },
        showCancelButton: true,
        confirmButtonText: 'Crear turno',
        preConfirm: () => {
          const pacienteId = $('#pacienteTurno').val();
          const fechaTurno = $('#fechaTurno').val();
          const horaTurno = $('#horaTurno').val();

          if (!pacienteId || !fechaTurno || !horaTurno) {
            Swal.showValidationMessage('Completa todos los campos');
            return false;
          }

          return {
            pacienteId,
            fechaHora: `${fechaTurno}T${horaTurno}`
          };
        }
      }).then(result => {
        if (result.isConfirmed) {
          fetch('/api/turnos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_paciente: result.value.pacienteId,
              fecha_hora: result.value.fechaHora,
              id_agenda: profesionalId
            })
          })
            .then(res => {
              if (!res.ok) throw new Error();
              Swal.fire('Turno creado', '', 'success');
              calendar.refetchEvents();
            })
            .catch(() => Swal.fire('Error al crear turno', '', 'error'));
        }
      });
    },

    eventClick: function (info) {
      const evento = info.event;
      const idTurno = evento.id; // ✅ Este id ahora está disponible gracias al backend

      Swal.fire({
        title: 'Detalle del turno',
        html: `
          <strong>Profesional:</strong> ${evento.title}<br>
          <strong>Paciente:</strong> ${evento.extendedProps.paciente || 'Sin asignar'}<br>
          <strong>Estado:</strong> ${evento.extendedProps.estado || '---'}<br>
          <strong>Hora:</strong> ${evento.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${evento.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br><br>
          <button id="btnReagendar" class="swal2-confirm swal2-styled" style="margin-right: 5px; background-color:#28a745">Reagendar</button>
          <button id="btnCancelar" class="swal2-cancel swal2-styled" style="background-color:#dc3545">Cancelar</button>
        `,
        showConfirmButton: false,
        showCancelButton: false,
        didOpen: () => {
          $('#btnReagendar').on('click', () => {
            Swal.fire({
              title: 'Reagendar turno',
              html: `
                <input id="nuevaFecha" type="date" class="swal2-input">
                <input id="nuevaHora" type="time" class="swal2-input">
              `,
              showCancelButton: true,
              confirmButtonText: 'Guardar',
              preConfirm: () => {
                const fecha = $('#nuevaFecha').val();
                const hora = $('#nuevaHora').val();
                if (!fecha || !hora) {
                  Swal.showValidationMessage('Debe ingresar fecha y hora');
                  return false;
                }
                return { fecha, hora };
              }
            }).then(result => {
              if (result.isConfirmed) {
                const nuevaFechaHora = `${result.value.fecha}T${result.value.hora}`;
                fetch(`/api/turnos/${idTurno}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fecha_hora: nuevaFechaHora })
                })
                .then(() => {
                  Swal.fire('Turno actualizado', '', 'success');
                  calendar.refetchEvents();
                })
                .catch(() => Swal.fire('Error al actualizar turno', '', 'error'));
              }
            });
          });

          $('#btnCancelar').on('click', () => {
            Swal.fire({
              title: '¿Cancelar turno?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, cancelar',
            }).then(res => {
              if (res.isConfirmed) {
                fetch(`/api/turnos/${idTurno}`, {
                  method: 'DELETE'
                })
                .then(() => {
                  Swal.fire('Turno cancelado', '', 'success');
                  calendar.refetchEvents();
                })
                .catch(() => Swal.fire('Error al cancelar turno', '', 'error'));
              }
            });
          });
        }
      });
    }
  });

  calendar.render();
  return calendar;
}
