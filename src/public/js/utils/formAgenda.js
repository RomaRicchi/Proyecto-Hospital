export function mostrarFormulario(agenda = {}) {
  Swal.fire({
    title: agenda.id_agenda ? 'Editar Agenda' : 'Nueva Agenda',
    html: `
      <select id="profesional" class="swal2-input select2" style="width: 100%"></select>
      <select id="dia" class="swal2-input" style="width: 100%"></select>
      <input id="inicio" type="time" class="swal2-input" placeholder="Hora inicio" value="${agenda.hora_inicio || ''}">
      <input id="fin" type="time" class="swal2-input" placeholder="Hora fin" value="${agenda.hora_fin || ''}">
      <input id="duracion" type="number" class="swal2-input" placeholder="Duración (min)" value="${agenda.duracion || ''}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    didOpen: () => {
      
      $('#profesional').select2({
        dropdownParent: $('.swal2-popup'),
        ajax: {
          url: '/api/agenda/buscar',
          dataType: 'json',
          delay: 250,
          processResults: (data) => ({ results: data }),
          cache: true
        }
      });
        fetch('/api/dias-semana')
            .then(res => res.json())
            .then(dias => {
                const $select = $('#dia');
                $select.empty().append('<option value="">Seleccione un día</option>');
                dias.forEach(d => {
                $select.append(new Option(d.nombre, d.id_dia));
                });
                if (agenda.id_dia) {
                $select.val(agenda.id_dia);
                }
            })
            .catch(() => {
                $('#dia').append('<option value="">Error al cargar días</option>');
            });
      // Preseleccionar si estamos editando
      if (agenda.personal) {
        const option = new Option(`${agenda.personal.apellido}, ${agenda.personal.nombre}`, agenda.id_personal_salud, true, true);
        $('#profesional').append(option).trigger('change');
      }

      if (agenda.id_dia) {
        $('#dia').val(agenda.id_dia);
      }
    },
    preConfirm: () => {
        const id_personal_salud = $('#profesional').val();
        const id_dia = $('#dia').val();
        const hora_inicio = $('#inicio').val();
        const hora_fin = $('#fin').val();
        const duracion = $('#duracion').val();

        if (!id_personal_salud || !id_dia || !hora_inicio || !hora_fin || !duracion) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return false;
        }

        // Validar que hora_fin > hora_inicio
        const [hIni, mIni] = hora_inicio.split(':').map(Number);
        const [hFin, mFin] = hora_fin.split(':').map(Number);
        const totalInicio = hIni * 60 + mIni;
        const totalFin = hFin * 60 + mFin;

        if (totalFin <= totalInicio) {
            Swal.showValidationMessage('La hora de fin debe ser mayor que la de inicio');
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
    const url = agenda.id_agenda ? `/api/agenda/${agenda.id_agenda}` : '/api/agenda';

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
