import { toUTC } from './validacionFechas.js';

export async function mostrarFormulario(turno = {}, onSuccess = () => {}) {
  const [pacientes, estados, motivos, obrasSociales] = await Promise.all([
    fetch('/api/pacientes').then(r => r.json()),
    fetch('/api/estadoTurno').then(r => r.json()),
    fetch('/api/motivos_ingreso').then(r => r.json()),
    fetch('/api/obras-sociales').then(r => r.json())
  ]);

  let agendas = [];

  const pacienteOptions = pacientes.map(p =>
    `<option value="${p.id_paciente}" ${turno?.id_paciente === p.id_paciente ? 'selected' : ''}>
      ${p.apellido_p}, ${p.nombre_p} (${p.dni_paciente})
    </option>`).join('');

  const obraSocialOptions = obrasSociales.map(o =>
    `<option value="${o.id_obra_social}" ${turno?.id_obra_social === o.id_obra_social ? 'selected' : ''}>${o.nombre}</option>`
  ).join('');

  const estadoOptions = estados.map(e =>
    `<option value="${e.id_estado}" ${turno?.id_estado === e.id_estado ? 'selected' : ''}>${e.nombre}</option>`
  ).join('');

  const motivoOptions = motivos.map(m => {
    const seleccionado =
      (turno?.id_motivo === m.id_motivo) || (!turno?.id_motivo && m.id_motivo === 12) ? 'selected' : '';
    return `<option value="${m.id_motivo}" ${seleccionado}>${m.tipo}</option>`;
  }).join('');

  let horaLocal = '';
  let fechaLocal = '';
  if (turno?.fecha_hora) {
    const fechaUTC = new Date(turno.fecha_hora);
    const local = new Date(fechaUTC.getTime() - fechaUTC.getTimezoneOffset() * 60000);
    horaLocal = local.toTimeString().slice(0, 5);
    fechaLocal = local.toISOString().slice(0, 10);
  }

  Swal.fire({
    title: turno?.id_turno ? 'Editar Turno' : 'Nuevo Turno',
    html: `
      <div class="form-group mb-2 text-start">
        <label for="id_paciente" class="form-label">Paciente</label>
        <select id="id_paciente" class="form-select">${pacienteOptions}</select>
      </div>
      <div class="form-group mb-2 text-start">
        <label for="id_obra_social" class="form-label">Obra Social</label>
        <select id="id_obra_social" class="form-select">
          <option value="">Seleccione obra social</option>
          ${obraSocialOptions}
        </select>
      </div>
      <div class="form-group mb-2 text-start">
        <label for="id_profesional" class="form-label">Profesional</label>
        <select id="id_profesional" class="form-select"></select>
      </div>
      <div class="form-group mb-2 text-start">
        <label for="id_agenda" class="form-label">Día de atención</label>
        <select id="id_agenda" class="form-select"></select>
      </div>
      <div class="form-group mb-2 text-start">
        <label for="fecha_turno" class="form-label">Fecha</label>
        <input id="fecha_turno" type="date" class="form-control" value="${fechaLocal}">
      </div>
      <div class="form-group mb-3 text-start">
        <label for="hora_turno" class="form-label">Hora</label>
        <input id="hora_turno" type="time" class="form-control" value="${horaLocal}">
      </div>
      ${turno?.id_turno ? `
        <div class="form-group mb-2 text-start">
          <label for="id_estado" class="form-label">Estado</label>
          <select id="id_estado" class="form-select">${estadoOptions}</select>
        </div>` : ''}
      <div class="form-group mb-2 text-start">
        <label for="id_motivo" class="form-label">Motivo</label>
        <select id="id_motivo" class="form-select">${motivoOptions}</select>
      </div>
    `,
    customClass: { popup: 'swal2-card-style' },
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    didOpen: () => {
      $('#id_paciente').select2({
        dropdownParent: $('.swal2-popup'),
        placeholder: 'Buscar paciente...',
        minimumInputLength: 2,
        width: '100%'
      });

      fetch('/api/agenda').then(r => r.json()).then(data => {
        agendas = data;
        const vistos = new Set();
        const profesionales = data.filter(a => {
          const id = a.personal?.id_personal_salud;
          if (vistos.has(id)) return false;
          vistos.add(id);
          return true;
        }).map(a => `<option value="${a.personal.id_personal_salud}">
          ${a.personal.apellido}, ${a.personal.nombre} (${a.personal?.especialidad?.nombre || '-'})
        </option>`);

        $('#id_profesional').html('<option value="">Seleccione profesional</option>' + profesionales.join(''));

        if (turno?.id_agenda) {
          const ag = agendas.find(a => a.id_agenda === turno.id_agenda);
          if (ag) {
            $('#id_profesional').val(ag.personal.id_personal_salud).trigger('change');
            const opcionesAgenda = agendas.filter(a => a.personal.id_personal_salud === ag.personal.id_personal_salud)
              .map(a => `<option value="${a.id_agenda}" ${a.id_agenda === turno.id_agenda ? 'selected' : ''}>
                ${a.dia.nombre} (${a.hora_inicio} - ${a.hora_fin})
              </option>`);
            $('#id_agenda').html('<option value="">Seleccione agenda</option>' + opcionesAgenda.join(''));
          }
        }
      });

      $('#id_profesional').on('change', function () {
        const id = parseInt(this.value);
        const opciones = agendas.filter(a => a.personal.id_personal_salud === id)
          .map(a => `<option value="${a.id_agenda}">${a.dia.nombre} (${a.hora_inicio} - ${a.hora_fin})</option>`);
        $('#id_agenda').html('<option value="">Seleccione agenda</option>' + opciones.join(''));
      });
    },
    preConfirm: () => {
      const id_paciente = parseInt($('#id_paciente').val());
      const id_obra_social = parseInt($('#id_obra_social').val()) || null;
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

      const fechaHoraStr = toUTC(`${fecha_turno}T${hora_turno}`, 'compact');
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
          const partes = str.split(':').map(Number);
          const h = partes[0] || 0;
          const m = partes[1] || 0;
          return h * 60 + m;
        };

        const minutosInput = toMinutes(hora_turno);
        const minutosInicio = toMinutes(agendaSeleccionada.hora_inicio);
        const minutosFin = toMinutes(agendaSeleccionada.hora_fin);

        if (minutosInput < minutosInicio || minutosInput >= minutosFin) {
          Swal.showValidationMessage(`Horario fuera de rango: ${agendaSeleccionada.hora_inicio} - ${agendaSeleccionada.hora_fin}`);
          return false;
        }

        if ((minutosInput - minutosInicio) % agendaSeleccionada.duracion !== 0) {
          Swal.showValidationMessage(`Debe ser múltiplo de ${agendaSeleccionada.duracion} min desde ${agendaSeleccionada.hora_inicio}`);
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
  }).then(result => {
    if (!result.isConfirmed) return;

    const url = turno?.id_turno ? `/api/turnos/${turno.id_turno}` : '/api/turnos';
    const metodo = turno?.id_turno ? 'PUT' : 'POST';

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
        Swal.fire('Éxito', 'Turno guardado correctamente', 'success');
        onSuccess();
      })
      .catch(err => {
        Swal.fire('Error', err.message, 'error');
      });
  });
}
