import {
  aplicarReservaSemanal,
  getFechaLocalParaInput,
  toUTC,
  validarFechaReservaRango,
  validarFechaNoPasada,
} from './validacionFechas.js';

export async function mostrarFormularioYRegistrarAdmision(
  paciente,
  id_cama,
  id_habitacion,
  fechaDashboard,
  edad,
  sector_nombre
) {
  const responseMotivos = await fetch('/api/motivos_ingreso');
  const motivos = await responseMotivos.json();

  const responseObras = await fetch('/api/obras-sociales');
  const obras = await responseObras.json();

  const responseMedicos = await fetch('/api/usuarios/medicos');
  const medicos = await responseMedicos.json();

  const motivosOptions = motivos
    .map(
      (m) =>
        `<option value="${m.id_motivo}" ${
          m.tipo === 'Internación' ? 'selected' : ''
        }>${m.tipo}</option>`
    )
    .join('');

  const obrasOptions = obras
    .map(
      (o) =>
        `<option value="${o.id_obra_social}" ${
          o.nombre === 'Sin obra social' ? 'selected' : ''
        }>${o.nombre}</option>`
    )
    .join('');

  const medicosOptions = medicos
    .map(
      (m) =>
        `<option value="${m.id_usuario}">
          ${m.apellido}, ${m.nombre} - Matrícula: ${m.matricula} - ${m.especialidad}
        </option>`
    )
    .join('');

  const fechaIngresoDefault = fechaDashboard
    ? new Date(fechaDashboard).toISOString().slice(0, 16)
    : getFechaLocalParaInput();

  const { value: result } = await Swal.fire({
    title: 'Nueva Admisión',
    html: `
      <div class="text-start">
        <p><strong>Paciente:</strong> ${paciente.apellido_p}, ${paciente.nombre_p} - ${edad} años</p>
        <p><strong>Habitación:</strong> ${id_habitacion} | <strong>Cama:</strong> ${id_cama} | <strong>Sector:</strong> ${sector_nombre}</p>
      </div>
      <form id="formAdmision" class="text-start">
        <label>Motivo ingreso</label>
        <select id="motivo" class="swal2-input" required>${motivosOptions}</select>

        <label>Obra social</label>
        <select id="obra_social" class="swal2-input">${obrasOptions}</select>

        <input id="num_asociado" class="swal2-input" placeholder="Número asociado">

        <label>Fecha ingreso</label>
        <input id="fecha_hora_ingreso" type="datetime-local" class="swal2-input" value="${fechaIngresoDefault}">

        <label>Descripción</label>
        <input id="descripcion" class="swal2-input" placeholder="Descripción (opcional)">

        <label>Fecha egreso (auto)</label>
        <input id="fecha_hora_egreso" type="datetime-local" class="swal2-input">

        <label>Motivo egreso</label>
        <input id="motivo_egr" class="swal2-input" placeholder="Motivo de egreso (opcional)">

        <label>Médico responsable</label>
        <select id="id_usuario" class="swal2-input">
          <option value="">-</option>
          ${medicosOptions}
        </select>
      </form>
    `,
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'swal2-card-style'
    },
    didOpen: () => {
      const inputIngreso = document.getElementById('fecha_hora_ingreso');
      const inputEgreso = document.getElementById('fecha_hora_egreso');
      const inputMotivoEgr = document.getElementById('motivo_egr');

      const ingresoFecha = new Date(inputIngreso.value);
      ingresoFecha.setHours(0, 0, 0, 0);

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (ingresoFecha > hoy) {
        aplicarReservaSemanal(inputIngreso, inputEgreso, inputMotivoEgr);
      } else {
        inputEgreso.disabled = false;
        inputEgreso.removeAttribute('title');
        inputMotivoEgr.disabled = false;
        inputMotivoEgr.placeholder = 'Motivo de egreso (opcional)';
        inputMotivoEgr.removeAttribute('title');
      }
    },
    preConfirm: () => {
      const motivo = document.getElementById('motivo').value;
      const obra_social = document.getElementById('obra_social').value;
      const num_asociado = document.getElementById('num_asociado').value;
      const fechaIngreso = document.getElementById('fecha_hora_ingreso').value;
      const fechaEgreso = document.getElementById('fecha_hora_egreso').value;
      const descripcion = document.getElementById('descripcion').value;
      const motivo_egr = document.getElementById('motivo_egr').value;
      const id_usuario = document.getElementById('id_usuario').value;

      const error = validarFechaNoPasada(fechaIngreso);
      if (error) {
        Swal.showValidationMessage(error);
        return false;
      }

      const ingreso = new Date(fechaIngreso);
      ingreso.setHours(0, 0, 0, 0);

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      let id_mov = 1;
      if (ingreso > hoy) {
        const errorReserva = validarFechaReservaRango(fechaIngreso);
        if (errorReserva) {
          Swal.showValidationMessage(errorReserva);
          return false;
        }
        id_mov = 3;
      }

      return {
        id_paciente: paciente.id_paciente,
        id_cama,
        id_habitacion,
        id_motivo: motivo,
        id_obra_social: obra_social,
        num_asociado,
        fecha_hora_ingreso: toUTC(fechaIngreso),
        fecha_hora_egreso: fechaEgreso ? toUTC(fechaEgreso) : null,
        descripcion,
        motivo_egr,
        id_usuario: id_usuario || null,
        id_mov
      };
    }
  });

  if (!result) return;

  try {
    const res = await fetch('/api/admisiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });

    const json = await res.json();

    if (!res.ok) throw new Error(json.error || 'Error inesperado');

    await Swal.fire('Éxito', 'Admisión registrada correctamente', 'success');
    location.reload();
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
}
