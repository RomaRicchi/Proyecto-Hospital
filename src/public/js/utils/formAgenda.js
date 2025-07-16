export function mostrarFormulario(agenda = {}) {
  Swal.fire({
    title: agenda.id_agenda ? 'Editar Agenda' : 'Nueva Agenda',
    html: `
      <select id="profesional" class="swal2-input">
        <option value="">Seleccione un profesional</option>
      </select>
      <select id="dia" class="swal2-input">
        <option value="">Seleccione un día</option>
      </select>
      <input id="hora_inicio" type="time" class="swal2-input" value="${agenda.hora_inicio || ''}">
      <input id="hora_fin" type="time" class="swal2-input" value="${agenda.hora_fin || ''}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    didOpen: async () => {
      const [profesionales, dias] = await Promise.all([
        fetch('/api/personal-salud').then(r => r.json()),
        fetch('/api/dias-semana').then(r => r.json())
      ]);

      const profSelect = document.getElementById('profesional');
      profesionales.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id_personal_salud;
        opt.textContent = `${p.apellido}, ${p.nombre} (${p.especialidad?.nombre || '-'})`;
        if (agenda.id_personal_salud === p.id_personal_salud) opt.selected = true;
        profSelect.appendChild(opt);
      });

      const diaSelect = document.getElementById('dia');
      dias.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id_dia;
        opt.textContent = d.nombre;
        if (agenda.id_dia === d.id_dia) opt.selected = true;
        diaSelect.appendChild(opt);
      });
    },
    preConfirm: () => {
      const id_personal_salud = parseInt(document.getElementById('profesional').value);
      const id_dia = parseInt(document.getElementById('dia').value);
      const hora_inicio = document.getElementById('hora_inicio').value;
      const hora_fin = document.getElementById('hora_fin').value;

      if (!id_personal_salud || !id_dia || !hora_inicio || !hora_fin) {
        Swal.showValidationMessage('Todos los campos son obligatorios');
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

      const duracion = minutosFin - minutosInicio;

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
