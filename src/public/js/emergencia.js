$(document).ready(function () {
  $('#formEmergencia').submit(async function (e) {
    e.preventDefault();

    const fechaIngreso = $('#fecha_hora_ingreso').val();
    const sexo = $('#sexo').val();
    const identificador = $('#identificador').val();
    const idUsuario = $('#id_usuario').val();

    if (!fechaIngreso || !sexo || !identificador) {
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
      fecha_hora_ingreso: fecha.toISOString(),
      sexo,
      identificador,
      id_usuario: idUsuario || null,
    };

    try {
      const res = await fetch('/api/emergencia', {
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
      console.error(err);
      Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
    }
  });

  // Cargar médicos dinámicamente
  fetch('/api/usuarios/medicos')
    .then((r) => r.json())
    .then((medicos) => {
      const select = $('#id_usuario');
      medicos.forEach((m) => {
        select.append(
          `<option value="${m.id_usuario}">${m.apellido}, ${m.nombre} — Matrícula: ${m.matricula}</option>`
        );
      });
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar el listado de médicos.', 'error');
    });
});
