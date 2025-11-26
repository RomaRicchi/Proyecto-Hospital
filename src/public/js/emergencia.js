import { toUTC, getFechaLocalParaInput } from './utils/validacionFechas.js';

$(document).ready(function () {
  $('#fecha_hora_ingreso').val(getFechaLocalParaInput());

  const tipoSelectHtml = `
    <label for="tipo_emergencia">Tipo de emergencia</label>
    <select id="tipo_emergencia" class="form-control" required>
      <option value="" disabled selected>Seleccione tipo</option>
      <option value="adulto">Adulto</option>
      <option value="niño">Niño</option>
    </select>
  `;
  $('#formEmergencia .form-group').first().before(tipoSelectHtml);

  // Cargar géneros
  fetch('/api/genero')
    .then((r) => r.json())
    .then((generos) => {
      const select = $('#sexo');
      select.empty().append('<option value="" disabled selected>Seleccione sexo</option>');
      generos.forEach((g) => {
        select.append(`<option value="${g.id_genero}">${g.nombre}</option>`);
      });
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar el listado de géneros.', 'error');
    });

    fetch('/api/usuarios/medicos')
      .then((r) => r.json())
      .then((medicos) => {
        const select = $('#id_usuario');
        select.empty().append('<option value="" disabled selected>Seleccione médico</option>');
        medicos.forEach((m) => {
          const especialidad = m.especialidad || 'Sin especialidad';
          select.append(
            `<option value="${m.id_usuario}">${m.apellido}, ${m.nombre} — ${especialidad}</option>`
          );
        });
      })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar el listado de médicos.', 'error');
    });

  $('#formEmergencia').submit(async function (e) {
    e.preventDefault();

    const fechaIngreso = $('#fecha_hora_ingreso').val();
    const sexo = $('#sexo').val();
    const identificador = $('#identificador').val();
    const idUsuario = $('#id_usuario').val();
    const tipoEmergencia = $('#tipo_emergencia').val();

    if (!fechaIngreso || !sexo || !identificador || !tipoEmergencia) {
      return Swal.fire('Error', 'Completa todos los campos obligatorios.', 'warning');
    }

    const fecha = new Date(fechaIngreso);
    if (isNaN(fecha.getTime())) {
      return Swal.fire('Error', 'Fecha inválida.', 'warning');
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fecha < hoy) {
      return Swal.fire('Error', 'La fecha no puede ser pasada.', 'warning');
    }

    const payload = {
      fecha_hora_ingreso: toUTC(fecha),
      sexo,
      identificador,
      id_usuario: idUsuario || null,
      tipo_emergencia: tipoEmergencia
    };

    try {
      const res = await fetch('/api/emergencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire('Error', data.error || 'Ocurrió un error', 'error');
      }

      Swal.fire('Ingreso exitoso', data.mensaje, 'success').then(() => location.reload());
    } catch (err) {
      Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
    }
  });
});
