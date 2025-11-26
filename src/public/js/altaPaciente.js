import {
  validarDNI,
  validarTexto,
  validarSelect
} from './utils/validacionesImput.js';

$(document).ready(function () {

  const dniGuardado = localStorage.getItem('dniParaBuscar');
  if (dniGuardado) {
    $('#busqueda').val(dniGuardado);
    localStorage.removeItem('dniParaBuscar');

    setTimeout(() => {
      $('#buscarPacienteForm').submit();
    }, 100);
  }

  $('#buscarPacienteForm').submit(async function (e) {
    e.preventDefault();
    const dni = $('#busqueda').val().trim();

    const errorDNI = validarDNI(dni);
    if (errorDNI) {
      Swal.fire('Error', errorDNI, 'warning');
      return;
    }

    const res = await fetch(`/api/admisiones/paciente/${dni}/admisiones-vigentes`);
    const data = await res.json();

    if (!data.success || !data.admision) {
      Swal.fire('No encontrado', data.message || 'No hay una admisión activa para este paciente', 'info');
      $('#resultadoBusqueda').html('');
      return;
    }

    const paciente = data.paciente;
    const admision = data.admision;
    const fechaIngreso = new Date(admision.fecha_hora_ingreso);
    const fechaIngresoStr = fechaIngreso.toLocaleString('es-AR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    const rawId = $('#usuarioData').data('id');
    const medicoLogueadoId = rawId ? parseInt(rawId) : null;

    const medicos = await fetch('/api/personal-salud').then((r) => r.json());
    const medicosOptions = medicos
      .map(m => {
        const selected = m.id_personal_salud === medicoLogueadoId ? 'selected' : '';
        return `<option value="${m.id_personal_salud}" ${selected}>${m.apellido}, ${m.nombre} — Matrícula: ${m.matricula}</option>`;
      })
      .join('');

  $('#resultadoBusqueda').html(`
    <div class="p-4 rounded bg-primary text-white">
      <h5 class="fw-bold">Datos del Paciente</h5>
      <table class="table table-bordered table-light table-sm">
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
            <td>${admision.descripcion || '-'}</td>
            <td>${fechaIngresoStr}</td>
          </tr>
        </tbody>
      </table>

      <h5 class="mt-4 fw-bold">Completar Alta Médica</h5>
      <form id="formEgreso" data-fecha-ingreso="${admision.fecha_hora_ingreso}">
        <div class="mb-3">
          <label for="fechaEgreso" class="form-label fw-bold">Fecha y hora de egreso</label>
          <input type="datetime-local" id="fechaEgreso" class="form-control" required>
        </div>

        <div class="mb-3">
          <label for="motivoEgreso" class="form-label fw-bold">Motivo del egreso</label>
          <input type="text" id="motivoEgreso" class="form-control" required>
        </div>

        <div class="mb-3">
          <label for="idUsuario" class="form-label fw-bold">Médico Responsable</label>
          <select id="idUsuario" class="form-control" required>
            <option value="">Seleccione médico</option>
            ${medicosOptions}
          </select>
        </div>

        <button type="submit" class="btn btn-success fw-bold">Dar de Alta</button>
      </form>
    </div>
  `);

  });

  $(document).on('submit', '#formEgreso', function (e) {
    e.preventDefault();
    const $form = $(this);
    const fechaIngreso = new Date($form.data('fecha-ingreso'));
    const fechaEgresoStr = $('#fechaEgreso').val();
    const motivoEgreso = $('#motivoEgreso').val().trim();
    const idPersonal = $('#idUsuario').val();

    if (!fechaEgresoStr) {
      return Swal.fire('Error', 'Debes indicar la fecha y hora de egreso.', 'warning');
    }

    const fechaIngresoLocal = new Date(fechaIngreso);
    fechaIngresoLocal.setMinutes(fechaIngresoLocal.getMinutes() - fechaIngresoLocal.getTimezoneOffset());

    const fechaEgreso = new Date(fechaEgresoStr);
    fechaEgreso.setMinutes(fechaEgreso.getMinutes() - fechaEgreso.getTimezoneOffset());

    if (fechaEgreso <= fechaIngresoLocal) {
      return Swal.fire('Error', 'La fecha de egreso debe ser posterior a la fecha de ingreso.', 'warning');
    }

    const errorMotivo = validarTexto(motivoEgreso, 'Motivo de egreso', 5, 100);
    if (errorMotivo) {
      return Swal.fire('Error', errorMotivo, 'warning');
    }

    const errorMedico = validarSelect(idPersonal, 'Médico responsable');
    if (errorMedico) {
      return Swal.fire('Error', errorMedico, 'warning');
    }

    const dni = $('#busqueda').val();
    const payload = {
      fecha_hora_egreso: fechaEgreso.toISOString(),
      motivo_egr: motivoEgreso,
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
          Swal.fire({
            title: 'Alta realizada',
            text: 'El paciente fue dado de alta correctamente',
            icon: 'success',
            customClass: {
              popup: 'swal2-card-style'
            },
            confirmButtonText: 'Ir a Registros Clínicos'
          }).then(() => {
            localStorage.setItem('dniParaBuscar', dni);
            window.location.href = '/registroClinico';
          });
        } else {
          Swal.fire('Error', data.message || 'No se pudo procesar el alta', 'error');
        }
      })
      .catch(() => Swal.fire('Error', 'No se pudo conectar con el servidor', 'error'));
  });
});
