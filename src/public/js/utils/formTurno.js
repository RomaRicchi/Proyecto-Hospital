import { toUTC } from './validacionFechas.js';

export async function mostrarFormulario(turno = {}, onSuccess = () => {}) {
  const [pacientes, estados, motivos] = await Promise.all([
    fetch('/api/pacientes').then(r => r.json()),
    fetch('/api/estadoTurno').then(r => r.json()),
    fetch('/api/motivos_ingreso').then(r => r.json())
  ]);

  let agendas = [];

  const pacienteOptions = pacientes.map(p =>
    `<option value="${p.id_paciente}" ${turno?.id_paciente === p.id_paciente ? 'selected' : ''}>
      ${p.apellido_p}, ${p.nombre_p}
    </option>`
  ).join('');

  const estadoOptions = estados.map(e =>
    `<option value="${e.id_estado}" ${turno?.id_estado === e.id_estado ? 'selected' : ''}>
      ${e.nombre}
    </option>`
  ).join('');

  const motivoOptions = motivos.map(m =>
    `<option value="${m.id_motivo}" ${turno?.id_motivo === m.id_motivo ? 'selected' : ''}>
      ${m.tipo}
    </option>`
  ).join('');

  Swal.fire({
    title: turno?.id_turno ? 'Editar Turno' : 'Nuevo Turno',
    html: `
      <select id="id_paciente" class="swal2-input select-paciente" style="width:100%">${pacienteOptions}</select>
      <select id="id_profesional" class="swal2-input"><option value="">Seleccione profesional</option></select>
      <select id="id_agenda" class="swal2-input"><option value="">Seleccione día de atención</option></select>
      <input id="fecha_turno" type="date" class="swal2-input" value="${turno?.fecha_hora ? new Date(turno.fecha_hora).toISOString().split('T')[0] : ''}">
      <input id="hora_turno" type="time" class="swal2-input" value="${turno?.fecha_hora ? new Date(turno.fecha_hora).toISOString().substring(11, 16) : ''}">
      ${turno?.id_turno ? `<select id="id_estado" class="swal2-input">${estadoOptions}</select>` : ''}
      <select id="id_motivo" class="swal2-input">${motivoOptions}</select>
    `,
    customClass: {
      popup: 'swal2-card-style'
    },
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

      fetch('/api/agenda')
        .then(r => r.json())
        .then(data => {
          agendas = data;

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

          const optionsProf = profesionalesUnicos.map(p =>
            `<option value="${p.id}">${p.nombre}</option>`).join('');
          $('#id_profesional').html('<option value="">Seleccione profesional</option>' + optionsProf);

          // si es edición, precargar la lista de agendas del profesional
          if (turno?.id_agenda) {
            const agendaTurno = agendas.find(a => a.id_agenda === turno.id_agenda);
            const idProfesional = agendaTurno?.personal?.id_personal_salud;
            if (idProfesional) {
              $('#id_profesional').val(idProfesional).trigger('change');
              const agendasDelProfesional = agendas.filter(a => a.personal.id_personal_salud === idProfesional);
              const opcionesAgenda = agendasDelProfesional.map(a =>
                `<option value="${a.id_agenda}" ${a.id_agenda === turno.id_agenda ? 'selected' : ''}>
                  ${a.dia.nombre} (${a.hora_inicio} a ${a.hora_fin})
                </option>`).join('');
              $('#id_agenda').html('<option value="">Seleccione día de atención</option>' + opcionesAgenda);
            }
          }
        });

      $('#id_profesional').on('change', function () {
        const idProfesional = parseInt(this.value);
        const agendasDelProfesional = agendas.filter(a => a.personal.id_personal_salud === idProfesional);

        const opcionesAgenda = agendasDelProfesional.map(a => {
          return `<option value="${a.id_agenda}">
            ${a.dia.nombre} (${a.hora_inicio} a ${a.hora_fin})
          </option>`;
        }).join('');

        $('#id_agenda').html('<option value="">Seleccione día de atención</option>' + opcionesAgenda);
      });
    },
    preConfirm: () => {
        const id_paciente = parseInt($('#id_paciente').val());
        const fecha_turno = $('#fecha_turno').val();
        const hora_turno = $('#hora_turno').val();
        const id_motivo = parseInt($('#id_motivo').val());
        const id_estado = turno?.id_turno ? parseInt($('#id_estado').val()) : 1;
        const id_agenda = parseInt($('#id_agenda').val());
        const agendaSeleccionada = agendas.find(a => a.id_agenda === id_agenda);

        if (!id_paciente || !id_agenda || !fecha_turno || !hora_turno || !id_motivo) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return false;
        }

        const fechaHora = new Date(`${fecha_turno}T${hora_turno}`);
        if (isNaN(fechaHora.getTime()) || fechaHora < new Date()) {
            Swal.showValidationMessage('La fecha y hora del turno deben ser futuras');
            return false;
        }

        if (agendaSeleccionada) {
            const diaAgenda = agendaSeleccionada.dia?.nombre?.toLowerCase();
            const diaTurno = fechaHora.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
            if (diaAgenda !== diaTurno) {
            Swal.showValidationMessage(`Este profesional atiende solo los días ${agendaSeleccionada.dia.nombre}`);
            return false;
            }

            const toMinutes = (str) => {
            const [h, m] = str.split(':').map(Number);
            return h * 60 + m;
            };

            const minutosInput = toMinutes(hora_turno);
            const minutosInicio = toMinutes(agendaSeleccionada.hora_inicio); // ya está en UTC
            const minutosFin = toMinutes(agendaSeleccionada.hora_fin);       // ya está en UTC

            if (minutosInput < minutosInicio || minutosInput >= minutosFin) {
            Swal.showValidationMessage(
                `Horario fuera de rango: ${agendaSeleccionada.hora_inicio} - ${agendaSeleccionada.hora_fin}`
            );
            return false;
            }
        }

        const fechaUTC = toUTC(fechaHora);

        return {
            id_paciente,
            id_agenda,
            fecha_hora: fechaUTC,
            id_estado,
            id_motivo
        };
        }

  }).then(result => {
    if (!result.isConfirmed) return;
   
    const metodo = turno?.id_turno ? 'PUT' : 'POST';
    const url = turno?.id_turno ? `/api/turnos/${turno.id_turno}` : '/api/turnos';
    fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.value)
    })
    .then(async res => {
        if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al guardar turno');
        }
        Swal.fire('Éxito', 'Turno guardado', 'success');
        onSuccess();
    })
    .catch(err => {
        Swal.fire('Error', err.message, 'error');
    });
  });
}
