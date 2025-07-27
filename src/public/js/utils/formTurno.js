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
      ${p.apellido_p}, ${p.nombre_p} (${p.dni_paciente})
    </option>`
  ).join('');

  const estadoOptions = estados.map(e =>
    `<option value="${e.id_estado}" ${turno?.id_estado === e.id_estado ? 'selected' : ''}>
      ${e.nombre}
    </option>`
  ).join('');

  const motivoOptions = motivos.map(m => {
    const seleccionado =
      (turno?.id_motivo === m.id_motivo) || (!turno?.id_motivo && m.id_motivo === 12)
        ? 'selected'
        : '';
    return `<option value="${m.id_motivo}" ${seleccionado}>${m.tipo}</option>`;
  }).join('');

  Swal.fire({
    title: turno?.id_turno ? 'Editar Turno' : 'Nuevo Turno',
    html: `
      <div class="form-group text-start" style="margin-bottom: 20px">
        <label for="id_paciente" class="form-label" style="display:block; margin-bottom: 4px;">Paciente</label>
        <select id="id_paciente" class="form-select">${pacienteOptions}</select>
      </div>
      <div class="form-group mb-3 text-start">
        <label for="id_obra_social" class="form-label">Obra Social</label>
        <select id="id_obra_social" class="form-select">
          <option value="">Seleccione obra social</option>
          ${obraSocialOptions}
        </select>
      </div>

      <div class="form-group mb-3 text-start">
        <label for="id_profesional" class="form-label">Profesional</label>
        <select id="id_profesional" class="form-select">
          <option value="">Seleccione profesional</option>
        </select>
      </div>

      <div class="form-group mb-3 text-start">
        <label for="id_agenda" class="form-label">Día de atención</label>
        <select id="id_agenda" class="form-select">
          <option value="">Seleccione día de atención</option>
        </select>
      </div>

      <div class="form-group mb-3 text-start">
        <label for="fecha_turno" class="form-label">Fecha</label>
        <input id="fecha_turno" type="date" class="form-control"
          value="${turno?.fecha_hora 
            ? new Date(turno.fecha_hora).toISOString().slice(0, 10) 
            : ''}"
      </div>

      <div class="form-group mb-3 text-start">
        <label for="hora_turno" class="form-label">Hora</label>
        <input id="hora_turno" type="time" class="form-control"
          value="${turno?.fecha_hora 
            ? new Date(turno.fecha_hora).toISOString().slice(11, 16) 
            : ''}"
      </div>

      ${turno?.id_turno ? `
        <div class="form-group mb-3 text-start">
          <label for="id_estado" class="form-label">Estado</label>
          <select id="id_estado" class="form-select">${estadoOptions}</select>
        </div>
      ` : ''}

      <div class="form-group mb-3 text-start">
        <label for="id_motivo" class="form-label">Motivo</label>
        <select id="id_motivo" class="form-select">${motivoOptions}</select>
      </div>
    `,

    customClass: {
      popup: 'swal2-card-style'
    },
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    didOpen: () => {
      $('#id_paciente').select2({
        dropdownParent: $('.swal2-popup'),
        placeholder: 'Buscar paciente por nombre o DNI...',
        minimumInputLength: 2,
        width: '100%',
        language: {
          inputTooShort: () => 'Ingrese al menos 2 caracteres',
          noResults: () => 'No se encontraron pacientes',
          searching: () => 'Buscando...'
        }
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
        const opcionesAgenda = agendasDelProfesional.map(a =>
          `<option value="${a.id_agenda}">
            ${a.dia.nombre} (${a.hora_inicio} a ${a.hora_fin})
          </option>`).join('');
        $('#id_agenda').html('<option value="">Seleccione día de atención</option>' + opcionesAgenda);
      });
    },
    preConfirm: () => {
      const id_paciente = parseInt($('#id_paciente').val());
      const id_obra_social = parseInt($('#id_obra_social').val()) || null;
      const fecha_turno = $('#fecha_turno').val(); // "2025-07-29"
      const hora_turno = $('#hora_turno').val();   // "10:00"
      const id_motivo = parseInt($('#id_motivo').val());
      const id_estado = turno?.id_turno ? parseInt($('#id_estado').val()) : 1;
      const id_agenda = parseInt($('#id_agenda').val());
      const agendaSeleccionada = agendas.find(a => a.id_agenda === id_agenda);

      if (!id_paciente || !id_agenda || !fecha_turno || !hora_turno || !id_motivo) {
        Swal.showValidationMessage('Todos los campos son obligatorios');
        return false;
      }

      const fechaHoraStr = toUTC(`${fecha_turno}T${hora_turno}`, 'compact'); // → '2025-07-31T12:00:00Z'
      const fechaLocal = new Date(fechaHoraStr); 
      if (isNaN(fechaLocal.getTime()) || fechaLocal < new Date()) {
        Swal.showValidationMessage('La fecha y hora del turno deben ser futuras');
        return false;
      }

      if (agendaSeleccionada) {
        const diaAgenda = agendaSeleccionada.dia?.nombre?.toLowerCase();
        const diaTurno = fechaLocal.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
        if (diaAgenda !== diaTurno) {
          Swal.showValidationMessage(`Este profesional atiende solo los días ${agendaSeleccionada.dia.nombre}`);
          return false;
        }

        const toMinutes = str => {
          const [h, m] = str.split(':').map(Number);
          return h * 60 + m;
        };

        const minutosInput = toMinutes(hora_turno);
        const minutosInicio = toMinutes(agendaSeleccionada.hora_inicio);
        const minutosFin = toMinutes(agendaSeleccionada.hora_fin);

        if (minutosInput < minutosInicio || minutosInput >= minutosFin) {
          Swal.showValidationMessage(
            `Horario fuera de rango: ${agendaSeleccionada.hora_inicio} - ${agendaSeleccionada.hora_fin}`
          );
          return false;
        }
        const minutosDesdeInicio = toMinutes(hora_turno) - toMinutes(agendaSeleccionada.hora_inicio);
        if (minutosDesdeInicio % agendaSeleccionada.duracion !== 0) {
          Swal.showValidationMessage(`El turno debe comenzar en un múltiplo de ${agendaSeleccionada.duracion} minutos desde ${agendaSeleccionada.hora_inicio}`);
          return false;
        }

      }

      return {
        id_paciente,
        id_obra_social,
        id_agenda,
        fecha_hora: fechaHoraStr, 
        id_estado,
        id_motivo
      };
    }
  })
  .then(result => {
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
