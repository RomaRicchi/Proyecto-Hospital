import { toUTC, fromUTCToArgentina } from './utils/validacionFechas.js';

$(document).ready(function () {
  const $tabla = $('#tablaRegistrosContainer');
  const $info = $('#infoPaciente');

  function determinarEstadoAdmision(fechaIngreso, fechaEgreso) {
    const ahora = new Date();
    const ingreso = new Date(fechaIngreso);
    const egreso = fechaEgreso ? new Date(fechaEgreso) : null;

    if (ingreso > ahora) return 'Reservada';
    if (!egreso || egreso > ahora) return 'Vigente';
    return 'Finalizada';
  }

  function agruparPorEpisodios(registros) {
    const grupos = [];
    let episodio = [];

    registros.forEach(r => {
      if (r.tipo === 'Ingreso') {
        if (episodio.length) grupos.push(episodio);
        episodio = [r];
      } else {
        episodio.push(r);
        if (r.tipo === 'Egreso') {
          grupos.push(episodio);
          episodio = [];
        }
      }
    });

    if (episodio.length) grupos.push(episodio); // por si hay registros sin egreso

    return grupos;
  }

  $('#btnBuscar').click(() => {
    const dni = $('#dniBuscar').val().trim();
    if (!dni) {
      Swal.fire('Ingrese un DNI válido');
      return;
    }

    fetch(`/api/registro-clinico/dni/${dni}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(data => {
        ultimaAdmisionPaciente = data.ultimaAdmision?.id_admision || null;
        if (!data || data.registros.length === 0) {
          mostrarInfoPaciente(data.paciente);
          mostrarBotonesAccion(data.paciente.id_paciente);
          $tabla.html('<div class="alert alert-warning">Este paciente no posee registros clínicos aún</div>');
          return;
        }
        mostrarInfoPaciente(data.paciente);
        mostrarBotonesAccion(data.paciente.id_paciente);
        const episodios = agruparPorEpisodios(data.registros);
        mostrarEpisodios(episodios);
      })
      .catch(() => {
        $tabla.html('<div class="alert alert-danger">Error al buscar registros</div>');
        $info.html('');
      });
  });

  function mostrarInfoPaciente(p) {
    if (!p) {
      $info.html('');
      return;
    }

    const edad = calcularEdad(p.fecha_nac);
    $info.html(`
      <div class="alert alert-info">
        <strong>Paciente:</strong> ${p.apellido_p}, ${p.nombre_p} &nbsp; | &nbsp;
        <strong>Edad:</strong> ${edad} años
      </div>
    `);
  }

  function calcularEdad(fechaNac) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  function mostrarEpisodios(grupos) {
    let html = '';
    grupos.reverse();
    grupos.forEach((episodio, index) => {
      const ingreso = episodio.find(r => r.tipo === 'Ingreso');
      const egreso = episodio.find(r => r.tipo === 'Egreso');

      const fechaIngreso = ingreso ? fromUTCToArgentina(ingreso.fecha) : null;
      const fechaEgreso = egreso ? fromUTCToArgentina(egreso.fecha) : null;

      const estado = ingreso
        ? determinarEstadoAdmision(fechaIngreso, fechaEgreso)
        : 'Ambulatorio';

      const textoFecha = ingreso
        ? `Ingreso: ${fechaIngreso.toLocaleDateString('es-AR')}`
        : 'Episodio ambulatorio o abierto';

      const colorEstado = {
        'Reservada': 'warning',
        'Vigente': 'success',
        'Finalizada': 'secondary',
        'Ambulatorio': 'info'
      }[estado] || 'dark';

      html += `
        <div class="card mb-4 shadow">
          <div class="card-header bg-${colorEstado} text-white">
            🏥 Episodio ${index + 1} – ${textoFecha} – <strong>Estado:</strong> ${estado}
          </div>
          <div class="card-body table-responsive">
            <table class="table table-sm table-bordered table-striped">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Detalle</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
      `;

      episodio.forEach(r => {
        html += `
          <tr>
            <td>${fromUTCToArgentina(r.fecha).toLocaleString('es-AR')}</td>
            <td>${r.tipo}</td>
            <td>${r.detalle}</td>
            <td>${r.usuario}</td>
          </tr>
        `;
      });

      html += '</tbody></table></div></div>';
    });

    $('#tablaRegistrosContainer').html(html);
  }

  function mostrarBotonesAccion(idPaciente) {
    $('#accionesRegistro').html(`
      <div class="d-flex justify-content-between mt-4 mb-4 p-3 ">
        <button id="btnNuevoRegistro" class="btn btn-success">
          <i class="fas fa-notes-medical me-1"></i> Registrar nuevo evento clínico
        </button>
        <button id="btnLimpiarBusqueda" class="btn btn-secondary">
          <i class="fas fa-times me-1"></i> Limpiar búsqueda
        </button>
      </div>
    `);

    $('#btnNuevoRegistro').click(async () => {
      try {
        const tipos = await fetch('/api/tipos-registro').then(res => res.json());

        const opciones = tipos.map(
          t => `<option value="${t.id_tipo}">${t.nombre}</option>`
        ).join('');

        const fechaActual = new Date().toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
        const ambulatorio = !ultimaAdmisionPaciente;

        Swal.fire({
          title: 'Nuevo Registro Clínico',
          html: `
            ${ambulatorio
              ? `<div class="alert alert-warning text-start" style="font-size: 0.9rem;">
                  <i class="fas fa-info-circle me-1"></i>
                  Este registro se asociará como <strong>ambulatorio</strong>, ya que el paciente no tiene una admisión activa.
                </div>`
              : ''}
            <select id="swal-tipo" class="swal2-input">
              <option disabled selected value="">Tipo de registro</option>
              ${opciones}
            </select>
            <textarea id="swal-detalle" class="swal2-textarea" placeholder="Detalle clínico..."></textarea>
            <input id="swal-fecha" type="datetime-local" class="swal2-input" value="${fechaActual}">
          `,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          preConfirm: () => {
            const id_tipo = $('#swal-tipo').val();
            const detalle = $('#swal-detalle').val().trim();
            const fecha_hora_reg = $('#swal-fecha').val();

            if (!id_tipo) {
              Swal.showValidationMessage('Debe seleccionar un tipo de registro');
              return false;
            }
            if (!detalle) {
              Swal.showValidationMessage('Debe completar el detalle');
              return false;
            }
            return { id_tipo, detalle, fecha_hora_reg };
          }
        }).then(async (result) => {
          if (!result.isConfirmed) return;

          const payload = {
            id_paciente: idPaciente,
            id_tipo: result.value.id_tipo,
            detalle: result.value.detalle,
            fecha_hora_reg: toUTC(result.value.fecha_hora_reg).toISOString(),
            id_usuario: 1, // 🔧 reemplazar con sesión actual
            id_admision: ultimaAdmisionPaciente  
          };

          const resp = await fetch('/api/registro-clinico', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.message || 'Error al registrar');
          }

          Swal.fire('Éxito', 'Registro clínico guardado', 'success').then(() =>
            location.reload()
          );
        });

      } catch (e) {
        Swal.fire('Error', 'No se pudo cargar el formulario', 'error');
      }
    });

    $('#btnLimpiarBusqueda').click(() => {
      $('#dniBuscar').val('');
      $('#infoPaciente').empty();
      $('#tablaRegistrosContainer').empty();
      $('#accionesRegistro').empty();
    });
  }

});
