$(document).ready(function () {
  const $fechaInput = $('#fecha_busqueda');
  const hoyISODate = new Date().toISOString().slice(0, 10);

  // Inicializar input de fecha a hoy y cargar camas
  $fechaInput.val(hoyISODate);
  buscarCamasDisponibles(hoyISODate);

  // Manejar el submit del formulario de búsqueda
  $('#formBuscarCamas').on('submit', function (e) {
    e.preventDefault();
    const fecha = $fechaInput.val();
    if (!fecha) {
      return Swal.fire('Atención', 'Debe seleccionar una fecha.', 'warning');
    }
    if (fecha < hoyISODate) {
      return Swal.fire('Atención', 'No puedes buscar una fecha anterior a hoy.', 'warning');
    }
    buscarCamasDisponibles(fecha);
  });

  function buscarCamasDisponibles(fecha) {
    $('#tablaCamasContainer').html(
      '<div class="text-center my-4"><div class="spinner-border"></div> Cargando...</div>'
    );
    fetch(`/api/camas/disponibles?fecha=${fecha}`)
      .then((res) => res.json())
      .then((camas) => renderTablaCamas(camas))
      .catch(() => {
        $('#tablaCamasContainer').html(
          '<div class="alert alert-danger">Error al cargar las camas.</div>'
        );
      });
  }

  function renderTablaCamas(camas) {
    let html = `
      <table id="tablaCamas" class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>Sector</th>
            <th>Habitación</th>
            <th>Cama</th>
            <th>Estado</th>
            <th>Paciente</th>
            <th>Género</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
    `;
    if (camas.length === 0) {
      html += `<tr><td colspan="7" class="text-center">No hay camas para la fecha seleccionada.</td></tr>`;
    } else {
      camas.forEach((cama) => {
        let estadoBadge = '';
        if (cama.estado === 'Disponible')
          estadoBadge = '<span class="badge bg-success">Disponible</span>';
        else if (cama.estado === 'Ocupada')
          estadoBadge = '<span class="badge bg-danger">Ocupada</span>';
        else if (cama.estado === 'Reservada')
          estadoBadge = '<span class="badge bg-warning text-dark">Reservada</span>';

        html += `
          <tr>
            <td>${cama.sector || '-'}</td>
            <td>${cama.habitacion || '-'}</td>
            <td>${cama.nombre_cama || '-'}</td>
            <td>${estadoBadge}</td>
            <td>${cama.paciente || '-'}</td>
            <td>${cama.genero || '-'}</td>
            <td>
              <button class="btn btn-sm btn-primary btn-asignar-paciente"
                      ${cama.estado !== 'Disponible' ? 'disabled' : ''}
                      data-id="${cama.id_cama}">
                Asignar paciente
              </button>
            </td>
          </tr>
        `;
      });
    }
    html += `</tbody></table>`;
    $('#tablaCamasContainer').html(html);

    $('#tablaCamas').DataTable({
      language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
      destroy: true,
    });
  }

  // Evento para el botón de asignar paciente
  $(document).on('click', '.btn-asignar-paciente', function () {
    const id_cama = $(this).data('id');
    let pacienteSeleccionado, camaSeleccionada, habitacionId;

    // Paso 1: Buscar paciente por DNI
    Swal.fire({
      title: 'Buscar Paciente por DNI',
      input: 'text',
      inputLabel: 'Ingrese DNI del paciente',
      inputPlaceholder: 'DNI',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      preConfirm: (dni) => {
        if (!dni) {
          Swal.showValidationMessage('Debe ingresar un DNI');
          return false;
        }
        return fetch(`/api/pacientes?dni=${dni}`)
          .then((res) => res.json())
          .then((pacientes) => {
            const busc = parseInt(dni, 10);
            const p = pacientes.find((p) => p.dni_paciente === busc);
            if (!p) throw new Error('No encontrado');
            pacienteSeleccionado = p;
            return p;
          })
          .catch(() => {
            Swal.fire({
              title: 'Paciente no encontrado',
              html: '¿Desea registrar un nuevo paciente?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Registrar',
            }).then((r) => {
              if (r.isConfirmed) window.location.href = '/paciente';
            });
            return false;
          });
      },
    }).then(async (result) => {
      if (result.isConfirmed && pacienteSeleccionado) {
        camaSeleccionada = await fetch(`/api/camas/${id_cama}`).then((r) => r.json());
        habitacionId = camaSeleccionada.id_habitacion;

        // Confirmar paciente
        const datos = `
          <strong>Nombre:</strong> ${pacienteSeleccionado.apellido_p}, ${pacienteSeleccionado.nombre_p}<br>
          <strong>DNI:</strong> ${pacienteSeleccionado.dni_paciente}<br>
          <strong>Género:</strong> ${pacienteSeleccionado.genero?.nombre || '-'}
        `;
        Swal.fire({
          title: '¿Es este el paciente correcto?',
          html: datos,
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
        }).then(async (confirma) => {
          if (!confirma.isConfirmed) return;

          // Verificar conflicto de género
          const resp = await fetch('/api/movimientos_habitacion/verificar-genero', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_habitacion: habitacionId,
              id_cama: id_cama,
              id_genero: pacienteSeleccionado.genero.id_genero,
            }),
          });
          const info = await resp.json();
          if (!resp.ok) {
            return Swal.fire('No permitido', info.message || 'Conflicto de género', 'error');
          }

          // Paso 4: formulario de admisión
          formularioAdmision(pacienteSeleccionado, id_cama, habitacionId);
        });
      }
    });
  });

  // Paso 4: Formulario de admisión y creación de movimiento
  async function formularioAdmision(paciente, id_cama, id_habitacion) {
    const motivos = await fetch('/api/motivos_ingreso').then((r) => r.json());
    const obras   = await fetch('/api/obras-sociales').then((r) => r.json());
    const medicos = await fetch('/api/personal-salud').then((r) => r.json());

    const motivosOptions = motivos.map(m => `<option value="${m.id_motivo}">${m.tipo}</option>`).join('');
    const obrasOptions   = obras  .map(o => `<option value="${o.id_obra_social}">${o.nombre}</option>`).join('');
    const medicosOptions = medicos.map(m => `<option value="${m.id_personal_salud}">${m.apellido}, ${m.nombre}</option>`).join('');

    const nowISOString = new Date().toISOString().slice(0,16); // YYYY-MM-DDTHH:mm

    Swal.fire({
      title: 'Registrar Admisión',
      html: `
        <select id="id_obra_social" class="swal2-input"><option value="">-- Obra Social --</option>${obrasOptions}</select>
        <input type="text" id="num_asociado" class="swal2-input" placeholder="N° Asociado">
        <select id="id_motivo" class="swal2-input"><option value="">-- Motivo --</option>${motivosOptions}</select>
        <label style="display:block;text-align:left;margin-top:8px;">Fecha y hora de ingreso</label>
        <input type="datetime-local" id="fecha_hora_ingreso" class="swal2-input" value="${nowISOString}" min="${nowISOString}">
        <label style="display:block;text-align:left;margin-top:8px;">Fecha y hora de egreso (opcional)</label>
        <input type="datetime-local" id="fecha_hora_egreso" class="swal2-input">
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción">
        <input type="text" id="motivo_egr" class="swal2-input" placeholder="Motivo egreso (opcional)">
        <select id="id_personal_salud" class="swal2-input"><option value="">-- Médico --</option>${medicosOptions}</select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const id_obra_social    = Swal.getPopup().querySelector('#id_obra_social').value;
        const num_asociado      = Swal.getPopup().querySelector('#num_asociado').value.trim();
        const id_motivo         = Swal.getPopup().querySelector('#id_motivo').value;
        const fecha_ingreso     = Swal.getPopup().querySelector('#fecha_hora_ingreso').value;
        const fecha_egreso      = Swal.getPopup().querySelector('#fecha_hora_egreso').value;
        const descripcion       = Swal.getPopup().querySelector('#descripcion').value.trim();
        const motivo_egr        = Swal.getPopup().querySelector('#motivo_egr').value.trim();
        const id_personal_salud = Swal.getPopup().querySelector('#id_personal_salud').value;

        if (!id_obra_social || !num_asociado || !id_motivo || !fecha_ingreso) {
          Swal.showValidationMessage('Completa todos los campos obligatorios.');
          return false;
        }
        if (fecha_ingreso < nowISOString) {
          Swal.showValidationMessage('La fecha de ingreso no puede ser anterior al momento actual.');
          return false;
        }

        return {
          id_obra_social,
          num_asociado,
          id_motivo,
          fecha_hora_ingreso: fecha_ingreso,
          fecha_hora_egreso: fecha_egreso || null,
          descripcion,
          motivo_egr: motivo_egr || null,
          id_personal_salud: id_personal_salud || null
        };
      }
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const bodyAdm = {
        id_paciente: paciente.id_paciente,
        ...result.value
      };
      const admRes = await fetch('/api/admisiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyAdm)
      });
      const admData = await admRes.json();
      const movRes = await fetch('/api/movimientos_habitacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_admision: admData.id_admision,
          id_habitacion,
          id_cama,
          fecha_hora_ingreso: admData.fecha_hora_ingreso,
          fecha_hora_egreso: admData.fecha_hora_egreso,
          id_mov: 1,
          estado: 1
        })
      });
      if (!movRes.ok) {
        const err = await movRes.json();
        return Swal.fire('Error', err.message || 'No se pudo asignar la cama', 'error');
      }
      Swal.fire('Listo', 'Paciente asignado y admitido correctamente', 'success')
        .then(() => location.reload());
    });
  }

  // 🔸 Función auxiliar para cargar habitaciones
  async function cargarHabitaciones() {
    try {
      const response = await fetch('/api/habitaciones');
      if (!response.ok) throw new Error();
      return await response.json();
    } catch {
      return [];
    }
  }
}); // <-- cierre de document.ready
