$(document).ready(function () { 
  $('#buscarPacienteForm').submit(async function (e) {
    e.preventDefault();
    const dni = $('#dni').val();

    const res = await fetch(
      `/api/admisiones/paciente/${dni}/admisiones-vigentes`
    );
    const data = await res.json();

    if (!data || !data.admision) {
      Swal.fire(
        'No encontrado',
        'No hay una admisión activa para este paciente',
        'info'
      );
      $('#resultadoBusqueda').html('');
      return;
    }

    const paciente = data.paciente;
    const admision = data.admision;
    const fechaIngreso = new Date(admision.fecha_hora_ingreso);
    const fechaIngresoStr = fechaIngreso.toLocaleString();

    // Obtener médicos
    const medicos = await fetch('/api/personal-salud').then((r) => r.json());
    const medicosOptions = medicos
      .map(
        (m) =>
          `<option value="${m.id_personal_salud}">${m.apellido}, ${m.nombre} — Matrícula: ${m.matricula}</option>`
      )
      .join('');

    // Renderizamos tabla + form, y guardamos fechaIngreso como data-* en el form
    $('#resultadoBusqueda').html(`
      <h5>Datos del Paciente</h5>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Motivo Ingreso</th>
            <th>Fecha Ingreso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${paciente.apellido_p}</td>
            <td>${paciente.nombre_p}</td>
            <td>${paciente.dni_paciente}</td>
            <td>${admision.descripcion}</td>
            <td>${fechaIngresoStr}</td>
          </tr>
        </tbody>
      </table>

      <h5 class="mt-4">Completar Alta Médica</h5>
      <form id="formEgreso" data-fecha-ingreso="${admision.fecha_hora_ingreso}">
        <div class="mb-3">
          <label for="fechaEgreso" class="form-label">Fecha y hora de egreso</label>
          <input type="datetime-local" id="fechaEgreso" class="form-control" required>
        </div>

        <div class="mb-3">
          <label for="motivoEgreso" class="form-label">Motivo del egreso</label>
          <input type="text" id="motivoEgreso" class="form-control" required>
        </div>

        <div class="mb-3">
          <label for="idUsuario" class="form-label">Médico Responsable</label>
          <select id="idUsuario" class="form-control" required>
            <option value="">Seleccione médico</option>
            ${medicosOptions}
          </select>
        </div>

        <button type="submit" class="btn btn-success">Dar de Alta</button>
      </form>
    `);
  });

  // Evento submit para el formulario dinámico
  $(document).on('submit', '#formEgreso', function (e) {
    e.preventDefault();

    // 1️⃣ Capturamos valores
    const $form = $(this);
    const fechaIngreso = new Date($form.data('fecha-ingreso'));
    const fechaEgreso   = $('#fechaEgreso').val();
    const motivoEgreso  = $('#motivoEgreso').val().trim();
    const idPersonal    = $('#idUsuario').val();

    // 2️⃣ Validaciones
    if (!fechaEgreso) {
      return Swal.fire('Error', 'Debes indicar la fecha y hora de egreso.', 'warning');
    }
    const fechaE = new Date(fechaEgreso);
    if (fechaE <= fechaIngreso) {
      return Swal.fire(
        'Error',
        'La fecha de egreso debe ser posterior a la fecha de ingreso.',
        'warning'
      );
    }
    if (motivoEgreso.length < 5) {
      return Swal.fire(
        'Error',
        'El motivo de egreso es obligatorio (mínimo 5 caracteres).',
        'warning'
      );
    }
    if (!idPersonal) {
      return Swal.fire('Error', 'Debes seleccionar un médico responsable.', 'warning');
    }

    // 3️⃣ Armamos el payload y enviamos
    const dni = $('#dni').val();
    const payload = {
      fecha_hora_egreso: fechaEgreso,
      motivo_egr:        motivoEgreso,
      id_personal_salud: idPersonal,
    };

    fetch(`/api/admisiones/paciente/${dni}/alta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          return Swal.fire('Error', text || 'Error inesperado del servidor', 'error');
        }
        const data = await res.json();
        if (data.success) {
          Swal.fire(
            'Alta realizada',
            'El paciente fue dado de alta correctamente',
            'success'
          ).then(() => location.reload());
        } else {
          Swal.fire('Error', data.message || 'No se pudo procesar el alta', 'error');
        }
      })
      .catch(() =>
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error')
      );
  });
});
