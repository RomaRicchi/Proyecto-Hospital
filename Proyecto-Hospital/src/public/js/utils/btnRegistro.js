import { toUTC, getFechaLocalParaInput } from './validacionFechas.js';
import { mostrarInfoPaciente } from './pctRegistro.js';
import { mostrarEpisodios, agruparPorEpisodios } from './episodiosRegistro.js';

export function mostrarBotonesAccion(idPaciente, ultimaAdmisionPaciente, idUsuarioLogueado, esInternacionActiva) {
  const rolUsuario = parseInt($('#usuarioData').data('rol')) || 0;
  
  const dniActual = $('#dniBuscar').val().trim();

  let btnAlta = '';
  if (rolUsuario !== 3 && esInternacionActiva) {
    btnAlta = `
      <button id="btnDarAlta" class="btn btn-danger px-4">
        <i class="fas fa-sign-out-alt me-1"></i> Dar de alta
      </button>`;
  }

  $('#accionesRegistro').html(`
    <div class="d-flex gap-2 flex-wrap justify-content-center mt-4 mb-4 p-3">
      <button id="btnNuevoRegistro" class="btn btn-success px-4">
        <i class="fas fa-notes-medical me-1"></i> Nuevo evento clínico
      </button>
      ${btnAlta}
      <button id="btnLimpiarBusqueda" class="btn btn-secondary px-4">
        <i class="fas fa-times me-1"></i> Limpiar búsqueda
      </button>
    </div>
  `);

  $('#btnDarAlta')?.on('click', () => {
    if (!dniActual) {
      Swal.fire('Error', 'No hay DNI cargado para alta', 'warning');
      return;
    }
    localStorage.setItem('dniParaBuscar', dniActual);
    localStorage.setItem('dniFueRecargado', 'true');
    window.location.href = `/paciente/alta?dni=${dniActual}`;
  });

  $('#btnNuevoRegistro').on('click', async () => {
    try {
      const tipos = await fetch('/api/tipos-registro').then(r => r.json());

      const opciones = tipos.map(t =>
        `<option value="${t.id_tipo}">${t.nombre}</option>`
      ).join('');

      const fechaAhora = getFechaLocalParaInput();
      const ambulatorio = !esInternacionActiva;

      Swal.fire({
        title: 'Nuevo Registro Clínico',
        html: `
          ${ambulatorio
            ? `<div class="alert alert-warning text-start" style="font-size: 0.9rem;">
                <i class="fas fa-info-circle me-1"></i>
                Este registro se asociará como <strong>ambulatorio</strong>.
              </div>` : ''}
          <select id="swal-tipo" class="swal2-input" style="width: 100%;">
            <option disabled selected value="">Tipo de registro</option>
            ${opciones}
          </select>
          <textarea id="swal-detalle" class="swal2-textarea" placeholder="Detalle clínico..."></textarea>
          <input id="swal-fecha" type="datetime-local" class="swal2-input" value="${fechaAhora}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        customClass: { popup: 'swal2-card-style' },
        preConfirm: () => {
          const id_tipo = $('#swal-tipo').val();
          const detalle = $('#swal-detalle').val().trim();
          const fecha_hora_reg = $('#swal-fecha').val();
          const fechaSeleccionadaUTC = new Date(fecha_hora_reg); // ya en ISO, UTC
          const ahoraUTC = new Date();

          const inicioHoyUTC = new Date(Date.UTC(
            ahoraUTC.getUTCFullYear(),
            ahoraUTC.getUTCMonth(),
            ahoraUTC.getUTCDate(),
            0, 0, 0
          ));

          const finHoyUTC = new Date(Date.UTC(
            ahoraUTC.getUTCFullYear(),
            ahoraUTC.getUTCMonth(),
            ahoraUTC.getUTCDate(),
            23, 59, 59, 999
          ));

          if (fechaSeleccionadaUTC < inicioHoyUTC || fechaSeleccionadaUTC > finHoyUTC) {
            Swal.showValidationMessage('Solo se permiten registros con fecha del día actual');
            return false;
          }

          if (!id_tipo) return Swal.showValidationMessage('Seleccione un tipo de registro');
          if (!detalle) return Swal.showValidationMessage('Debe completar el detalle');
          return { id_tipo, detalle, fecha_hora_reg };
        }
      }).then(async result => {
        if (!result.isConfirmed) return;

        const payload = {
          id_paciente: idPaciente,
          id_tipo: result.value.id_tipo,
          detalle: result.value.detalle,
          fecha_hora_reg: toUTC(result.value.fecha_hora_reg),
          id_usuario: idUsuarioLogueado,
          id_admision: esInternacionActiva ? ultimaAdmisionPaciente : null  // ✅ importante
        };

        const resp = await fetch('/api/registro-clinico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const error = await resp.json();
          throw new Error(error.message || 'Error al guardar');
        }

        Swal.fire('Éxito', 'Registro clínico guardado', 'success');

        fetch(`/api/registro-clinico/dni/${dniActual}`)
          .then(res => res.json())
          .then(data => {
            const registros = data.registros.map(r => ({
              ...r,
              fecha: new Date(r.fecha),
              id: r.id
            }));

            mostrarInfoPaciente(data.paciente, data.cama);
            mostrarBotonesAccion(data.paciente.id_paciente, data.ultimaAdmision?.id_admision, idUsuarioLogueado, esInternacionActiva);
            const episodios = agruparPorEpisodios(registros);
            mostrarEpisodios(episodios);
          })
          .catch(() => {
            Swal.fire('Advertencia', 'Registro guardado, pero no se pudo actualizar la tabla', 'warning');
          });

      });
    } catch (error) {
      console.error('❌ Error cargando tipos de registro:', error);
      Swal.fire('Error', 'No se pudo abrir el formulario', 'error');
    }
  });

  $('#btnLimpiarBusqueda').on('click', () => {
    $('#dniBuscar').val('');
    $('#infoPaciente').empty();
    $('#tablaRegistrosContainer').empty();
    $('#accionesRegistro').empty();
  });
}
