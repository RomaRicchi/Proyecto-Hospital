import {  toUTC, 
          getFechaLocalParaInput
} from './utils/validacionFechas.js';
import { calcularEdad } from './utils/validarSectorPaciente.js';

$(document).ready(function () {
  const $tabla = $('#tablaRegistrosContainer');
  const $info = $('#infoPaciente');
  let registrosPaciente = [];
  let ultimaAdmisionPaciente = null;
  const idUsuarioLogueado = $('#usuarioData').data('id') || 1;
  const dniGuardado = localStorage.getItem('dniParaBuscar');
  if (dniGuardado) {
    $('#dniBuscar').val(dniGuardado);
    localStorage.removeItem('dniParaBuscar');
    $('#btnBuscar').click();
  }

  function determinarEstadoAdmision(fechaIngreso, fechaEgreso) {
    const ahora = new Date();
    const ingreso = new Date(fechaIngreso);
    const egreso = fechaEgreso ? new Date(fechaEgreso) : null;

    if (ingreso > ahora) return 'Reservada';
    if (!egreso || egreso > ahora) return 'Vigente';
    return 'Finalizada';
  }

  const ID_INGRESO = 30;
  const ID_EGRESO = 31;

  function agruparPorEpisodios(registros) {
    const grupos = [];
    let episodio = [];

    const ordenados = [...registros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    ordenados.forEach(r => {
      if (r.id_tipo === ID_INGRESO) {
        if (episodio.length) grupos.push(episodio);
        episodio = [r];
      } else {
        episodio.push(r);
        if (r.id_tipo === ID_EGRESO) {
          grupos.push(episodio);
          episodio = [];
        }
      }
    });

    if (episodio.length > 0) grupos.push(episodio);

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
      console.log('Respuesta del servidor:', data);
      if (!data || !Array.isArray(data.registros) || data.registros.length === 0) {
        if (data?.paciente) {
          mostrarInfoPaciente(data.paciente, data.cama);
          mostrarBotonesAccion(data.paciente.id_paciente);
        } else {
          $info.html('');
          $('#accionesRegistro').empty();
        }

        $tabla.html('<div class="alert alert-warning">Este paciente no posee registros clínicos aún</div>');
        return;
      }
        console.log("Fechas crudas:", data.registros.map(r => r.fecha));

      registrosPaciente = data.registros.map(r => ({
        ...r,
        fecha: new Date(r.fecha),// importante: NO toISOString +3hs
        id: r.id  
      }));

      mostrarInfoPaciente(data.paciente, data.cama);
      mostrarBotonesAccion(data.paciente.id_paciente);

      const episodios = agruparPorEpisodios(registrosPaciente);
      mostrarEpisodios(episodios);
    })
    .catch((err) => {
      Swal.fire('Error', err.message || 'No se pudo cargar el formulario', 'error');
    });
  });

  function mostrarInfoPaciente(p, cama = null) {
    if (!p) {
      $info.html('');
      return;
    }

    const edad = calcularEdad(p.fecha_nac);
    let html = `
      <div class="alert alert-info">
        <strong>Paciente:</strong> ${p.apellido_p}, ${p.nombre_p} &nbsp; | &nbsp;
        <strong>Edad:</strong> ${edad} años
    `;

    if (cama) {
      html += ` &nbsp; | &nbsp; <strong>Cama:</strong> ${cama.nombre} - Hab ${cama.habitacion} (${cama.sector})`;
    }

    html += `</div>`;
    $info.html(html);
  }

  function mostrarEpisodios(grupos) {
    let html = '';
    grupos.reverse();
    grupos.forEach((episodio, index) => {
      const ingreso = episodio.find(r => r.id_tipo === ID_INGRESO);
      const egreso = episodio.find(r => r.id_tipo === ID_EGRESO);

      const fechaIngreso = ingreso ? new Date(ingreso.fecha) : null;
      const fechaEgreso = egreso ? new Date(egreso.fecha) : null;

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
            Episodio ${index + 1} – ${textoFecha} – <strong>Estado:</strong> ${estado}
          </div>
          <div class="card-body table-responsive">
            <table class="table table-sm table-bordered table-striped">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Detalle</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
      `;

      episodio.forEach((r, i) => {
        html += `
          <tr>
            <td>${
              r.fecha && !isNaN(new Date(r.fecha))
                ? new Date(r.fecha).toLocaleString('es-AR', {hour12:false})
                : '—'
            }</td>
            <td>${r.tipo}</td>
            <td>${r.detalle}</td>
            <td>${r.usuario}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary btn-editar-registro" 
                      data-id="${r.id}"
                      data-index="${i}" 
                      data-tipo="${r.id_tipo}" 
                      data-fecha="${r.fecha}" 
                      data-detalle="${r.detalle}">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
        `;
      });
      html += '</tbody></table></div></div>';
    });

    $('#tablaRegistrosContainer').html(html);
  }

  function mostrarBotonesAccion(idPaciente) {
    const dniActual = $('#dniBuscar').val().trim(); 
    if (localStorage.getItem('dniFueRecargado')) {
      Swal.fire({
        icon: 'info',
        title: 'Paciente cargado automáticamente',
        text: `DNI: ${dniActual}`,
        timer: 2500,
        showConfirmButton: false
      });
      localStorage.removeItem('dniFueRecargado');
    }

    $('#accionesRegistro').html(`
      <div class="d-flex gap-2 flex-wrap justify-content-center mt-4 mb-4 p-3">
        <button id="btnNuevoRegistro" class="btn btn-success px-4">
          <i class="fas fa-notes-medical me-1"></i> Nuevo evento clínico
        </button>
        <button id="btnDarAlta" class="btn btn-danger px-4" ${!ultimaAdmisionPaciente ? 'disabled' : ''}>
          <i class="fas fa-sign-out-alt me-1"></i> Dar de alta
        </button>
        <button id="btnLimpiarBusqueda" class="btn btn-secondary px-4">
          <i class="fas fa-times me-1"></i> Limpiar búsqueda
        </button>
      </div>
    `);

    $('#btnDarAlta').click(() => {
      const dni = $('#dniBuscar').val().trim();
      if (!dni) {
        Swal.fire('Error', 'No hay DNI cargado para alta', 'warning');
        return;
      }
      localStorage.setItem('dniParaBuscar', dni);
      localStorage.setItem('dniFueRecargado', 'true'); 
      window.location.href = `/paciente/alta?dni=${dni}`;
    });

    $('#btnNuevoRegistro').click(async () => {
      try {
        const tipos = await fetch('/api/tipos-registro').then(res => res.json());

        const opciones = tipos.map(
          t => `<option value="${t.id_tipo}">${t.nombre}</option>`
        ).join('');

        const fechaActual = getFechaLocalParaInput();
        const ambulatorio = !ultimaAdmisionPaciente;
        const dniActual = $('#dniBuscar').val().trim(); // ← lo usamos luego

        Swal.fire({
          title: 'Nuevo Registro Clínico',
          html: `
            ${ambulatorio
              ? `<div class="alert alert-warning text-start" style="font-size: 0.9rem;">
                  <i class="fas fa-info-circle me-1"></i>
                  Este registro se asociará como <strong>ambulatorio</strong>, ya que el paciente no tiene una admisión activa.
                </div>`
              : ''}
            <div style="overflow-x: auto; max-width: 100%;">
              <select id="swal-tipo" class="swal2-input" style="width: 100%; font-size: 0.9rem;">
                <option disabled selected value="">Tipo de registro</option>
                ${opciones}
              </select>
            </div>
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
            id_usuario: idUsuarioLogueado,
            id_admision: ultimaAdmisionPaciente
          };

          try {
            const resp = await fetch('/api/registro-clinico', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (!resp.ok) {
              const err = await resp.json();
              throw new Error(err.message || 'Error al registrar');
            }

            Swal.fire('Éxito', 'Registro clínico guardado', 'success');

            // 🔄 Recargar registros del paciente desde el backend
            fetch(`/api/registro-clinico/dni/${dniActual}`)
              .then(res => res.json())
              .then(data => {
                registrosPaciente = data.registros.map(r => ({
                  ...r,
                  fecha: new Date(r.fecha),
                  id: r.id
                }));

                mostrarInfoPaciente(data.paciente, data.cama);
                mostrarBotonesAccion(data.paciente.id_paciente);
                const episodios = agruparPorEpisodios(registrosPaciente);
                mostrarEpisodios(episodios);
              })
              .catch(() => {
                Swal.fire('Advertencia', 'El registro fue guardado, pero hubo un error al refrescar los datos.', 'warning');
              });

          } catch (e) {
            Swal.fire('Error', e.message || 'No se pudo guardar el registro', 'error');
          }
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

  $(document).on('click', '.btn-editar-registro', async function () {
    const $btn = $(this);
    const id = $btn.data('id');
    const tipo = $btn.data('tipo');
    const detalle = $btn.data('detalle');
    const fecha = $btn.data('fecha');

    const fechaFormateada = fecha
      ? new Date(fecha).toISOString().slice(0, 16)
      : getFechaLocalParaInput();

    const tipos = await fetch('/api/tipos-registro').then(res => res.json());

    const opciones = tipos.map(
      t => `<option value="${t.id_tipo}" ${t.id_tipo == tipo ? 'selected' : ''}>${t.nombre}</option>`
    ).join('');

    Swal.fire({
      title: 'Editar Registro Clínico',
      html: `
        <select id="swal-tipo" class="swal2-input">
          <option disabled value="">Tipo de registro</option>
          ${opciones}
        </select>
        <textarea id="swal-detalle" class="swal2-textarea">${detalle}</textarea>
        <input id="swal-fecha" type="datetime-local" class="swal2-input" value="${fechaFormateada}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      customClass: {
					popup: 'swal2-card-style'
				},
      preConfirm: () => {
        const id_tipo = $('#swal-tipo').val();
        const detalle = $('#swal-detalle').val().trim();
        const fecha_hora_reg = $('#swal-fecha').val();

        if (!id_tipo || !detalle || !fecha_hora_reg) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return { id_tipo, detalle, fecha_hora_reg };
      }
    }).then(async result => {
      if (!result.isConfirmed) return;

      const payload = {
        id_tipo: result.value.id_tipo,
        detalle: result.value.detalle,
        fecha_hora_reg: toUTC(result.value.fecha_hora_reg).toISOString(),
        id_usuario: idUsuarioLogueado
      };

      try {
        const idRegistro = registrosPaciente[index].id;
        const resp = await fetch(`/api/registro-clinico/${idRegistro}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const error = await resp.json();
          throw new Error(error.message || 'Error al actualizar');
        }

        Swal.fire('Actualizado', 'El registro fue editado correctamente', 'success');

        $('#btnBuscar').click(); 

      } catch (e) {
        Swal.fire('Error', e.message || 'No se pudo actualizar el registro', 'error');
      }
    });
  });
});
