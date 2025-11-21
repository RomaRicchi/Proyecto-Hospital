import { mostrarBotonesAccion } from './utils/btnRegistro.js';
import {
  mostrarInfoPaciente,
  tieneInternacionActiva
} from './utils/pctRegistro.js';
import {
  mostrarEpisodios,
  agruparPorEpisodios
} from './utils/episodiosRegistro.js';
import { toUTC } from './utils/validacionFechas.js';

$(document).ready(function () {

  const $tabla = $('#tablaRegistrosContainer');
  const $info = $('#infoPaciente');
  const $select = $('#selectTipo');
  const urlParams = new URLSearchParams(window.location.search);
  const dniParam = urlParams.get('dni');
  if (dniParam) {
    $('#dniBuscar').val(dniParam);
    $('#btnBuscar').click();
  }

  const idUsuarioLogueado = $('#usuarioData').data('id') || 1;
  let ultimaAdmisionPaciente = null;
  let esInternacionActiva = false;
  let registrosPaciente = [];

  const dniGuardado = localStorage.getItem('dniParaBuscar');
  if (dniGuardado) {
    $('#dniBuscar').val(dniGuardado);
    localStorage.removeItem('dniParaBuscar');
    $('#btnBuscar').click();
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
        const admision = data.ultimaAdmision;
        ultimaAdmisionPaciente = admision?.id_admision || null;
        esInternacionActiva = tieneInternacionActiva(data.registros, admision?.id_admision);

        if (!data || !Array.isArray(data.registros) || data.registros.length === 0) {
          $('#filtroTipoRegistro').hide(); 
          if (data?.paciente) {
            mostrarInfoPaciente(data.paciente, data.cama);

            mostrarBotonesAccion(
              data.paciente.id_paciente,
              ultimaAdmisionPaciente,
              idUsuarioLogueado,
              esInternacionActiva
            );
          } else {
            $info.html('');
            $('#accionesRegistro').empty();
          }

          $tabla.html('<div class="alert alert-warning">Este paciente no posee registros clínicos aún</div>');
          return;
        }

        registrosPaciente = data.registros.map(r => ({
          ...r,
          fecha: new Date(r.fecha),
          id: r.id
        }));
        window.registrosPaciente = registrosPaciente;
        mostrarInfoPaciente(data.paciente, data.cama);

        esInternacionActiva = tieneInternacionActiva(data.registros, admision?.id_admision);

        mostrarBotonesAccion(
          data.paciente.id_paciente,
          ultimaAdmisionPaciente,
          idUsuarioLogueado,
          esInternacionActiva
        );

        // Cargar tipos de registro desde la base
        fetch('/api/tipos-registro')
          .then(res => res.json())
          .then(tipos => {
            $select.html(`<option value="Todos">Todos</option>`);
            tipos.forEach(t => {
              $select.append(`<option value="${t.nombre}">${t.nombre}</option>`);
            });
          });

        // Evento de cambio del filtro
        $select.off('change').on('change', function () {
          const tipo = $(this).val();
          if (tipo === 'Todos') {
            mostrarEpisodios(agruparPorEpisodios(registrosPaciente));
          } else {
            const filtrados = registrosPaciente.filter(r => r.tipo === tipo);
            mostrarEpisodios(agruparPorEpisodios(filtrados));
          }
        });

        $('#filtroTipoRegistro').removeClass('d-none');
        mostrarEpisodios(agruparPorEpisodios(registrosPaciente));
      })
      .catch(err => {
        Swal.fire('Error', err.message || 'No se pudo cargar el formulario', 'error');
      });
  });
});

$(document).on('click', '.btn-editar-registro', async function () {
  const $btn = $(this);
  const id = $btn.data('id');
  const tipo = $btn.data('tipo');
  const detalle = $btn.data('detalle');
  const fecha = $btn.data('fecha');

  const fechaFormateada = fecha
    ? new Date(fecha).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

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
      <input id="swal-fecha" type="datetime-local" class="swal2-input" value="${fechaFormateada}" readonly disabled
      title="La fecha no se puede modificar">
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
      fecha_hora_reg: toUTC(result.value.fecha_hora_reg),
      id_usuario: $('#usuarioData').data('id')
    };

    try {
      const resp = await fetch(`/api/registro-clinico/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error('Error al guardar');

      Swal.fire('Actualizado', 'El registro fue editado correctamente', 'success');
      $('#btnBuscar').click();
    } catch (e) {
      Swal.fire('Error', e.message || 'No se pudo actualizar el registro', 'error');
    }
  });
});
