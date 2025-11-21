import { toUTC } from './validacionFechas.js';

export function mostrarFormulario(agenda = {}) {
  Swal.fire({
    title: agenda.id_agenda ? 'Editar Agenda' : 'Nueva Agenda',
    html: `
      <form id="agendaForm">
        <div class="mb-3">
          <label for="profesional" class="form-label text-white">Profesional</label>
          <select id="profesional" class="form-select">
            <option value="">Seleccione un profesional</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="dia" class="form-label text-white">Día</label>
          <select id="dia" class="form-select">
            <option value="">Seleccione un día</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="hora_inicio" class="form-label text-white">Hora inicio</label>
          <input id="hora_inicio" type="time" class="form-control" value="${agenda.hora_inicio || ''}">
        </div>
        <div class="mb-3">
          <label for="hora_fin" class="form-label text-white">Hora fin</label>
          <input id="hora_fin" type="time" class="form-control" value="${agenda.hora_fin || ''}">
        </div>
        <div class="mb-3">
          <label for="duracion_turno" class="form-label text-white">Duración del turno</label>
          <select id="duracion_turno" class="form-select">
            <option value="">Duración de cada turno</option>
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
          </select>
        </div>
      </form>
    `,
    customClass: {
      popup: 'swal2-card-style'
    },
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    didOpen: async () => {
      const usuarioDataEl = document.getElementById('usuarioData');
      const usuario = {
        rol: Number(usuarioDataEl.dataset.rol),
        id_personal_salud: Number(usuarioDataEl.dataset.idPersonalSalud),
        nombre: usuarioDataEl.dataset.nombre,
        apellido: usuarioDataEl.dataset.apellido
      };

      const [profesionales, dias] = await Promise.all([
        fetch('/api/personal-salud').then(r => r.json()),
        fetch('/api/dias-semana').then(r => r.json())
      ]);

      const profSelect = document.getElementById('profesional');
      if (usuario.rol === 4) {
        const opt = document.createElement('option');
        opt.value = usuario.id_personal_salud;
        opt.textContent = `${usuario.apellido}, ${usuario.nombre}`;
        opt.selected = true;
        profSelect.appendChild(opt);
        profSelect.disabled = true;
      } else {
        profesionales.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id_personal_salud;
          opt.textContent = `${p.apellido}, ${p.nombre} (${p.especialidad?.nombre || '-'})`;
          if (agenda.id_personal_salud === p.id_personal_salud) opt.selected = true;
          profSelect.appendChild(opt);
        });
      }

      const diaSelect = document.getElementById('dia');
      dias.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id_dia;
        opt.textContent = d.nombre;
        if (agenda.id_dia === d.id_dia) opt.selected = true;
        diaSelect.appendChild(opt);
      });

      if (agenda.duracion) {
        const duracionSelect = document.getElementById('duracion_turno');
        duracionSelect.value = String(agenda.duracion);
      }
    },
    preConfirm: () => {
      const id_personal_salud = parseInt(document.getElementById('profesional').value);
      const id_dia = parseInt(document.getElementById('dia').value);
      const hora_inicio = document.getElementById('hora_inicio').value.trim().slice(0, 5);
      const hora_fin = document.getElementById('hora_fin').value.trim().slice(0, 5);
      const duracion = parseInt(document.getElementById('duracion_turno').value);

      if (!id_personal_salud || !id_dia || !hora_inicio || !hora_fin || !duracion) {
        Swal.showValidationMessage('Todos los campos son obligatorios, incluyendo la duración');
        return false;
      }

      const [hIni, mIni] = hora_inicio.split(':').map(Number);
      const [hFin, mFin] = hora_fin.split(':').map(Number);
      const minutosInicio = hIni * 60 + mIni;
      const minutosFin = hFin * 60 + mFin;

      if (minutosFin <= minutosInicio) {
        Swal.showValidationMessage('La hora de fin debe ser mayor que la de inicio');
        return false;
      }

      if (duracion > (minutosFin - minutosInicio)) {
        Swal.showValidationMessage('La duración del turno no puede ser mayor al intervalo disponible');
        return false;
      }

      return {
        id_personal_salud,
        id_dia,
        hora_inicio,
        hora_fin,
        duracion
      };
    }
  }).then(result => {
    if (!result.isConfirmed) return;

    const metodo = agenda.id_agenda ? 'PUT' : 'POST';
    const url = agenda.id_agenda
      ? `/api/agenda/${agenda.id_agenda}`
      : '/api/agenda';

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.value)
    })
      .then(res => {
        if (!res.ok) throw new Error('Fallo al guardar');
        return res.json();
      })
      .then(() => {
        Swal.fire('Éxito', 'Agenda guardada correctamente', 'success');
        location.reload();
      })
      .catch(err => {
        console.error('Error al guardar agenda:', err);
        Swal.fire('Error', 'No se pudo guardar la agenda', 'error');
      });
  });
}
