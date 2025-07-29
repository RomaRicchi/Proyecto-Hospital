import { toUTC } from "./utils/validacionFechas.js";

$(document).ready(function () {
  const tabla = $('#tablaAdmisiones');
  let dt;
  if (tabla.length) {
    dt = tabla.DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
      destroy: true,
      responsive: true,
      scrollX: false,
      columnDefs: [{ targets: [10], orderable: false, searchable: false }],
    });
  }

  async function getOpcionesAdmision() {
    const res = await fetch('/api/admisiones/opciones');
    return await res.json();
  }

  $(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    const admision = await fetch(`/api/admisiones/${id}`).then((r) => r.json());
    const opciones = await getOpcionesAdmision();

    const selectPacientes = `
      <select id="swal-id_paciente" class="swal2-input">
        ${opciones.pacientes.map((p) => `
          <option value="${p.id_paciente}" ${admision.id_paciente === p.id_paciente ? 'selected' : ''}>
            ${p.apellido_p} ${p.nombre_p}
          </option>`).join('')}
      </select>`;

    const selectObraSocial = `
      <select id="swal-id_obra_social" class="swal2-input">
        ${opciones.obrasSociales.map((o) => `
          <option value="${o.id_obra_social}" ${admision.id_obra_social === o.id_obra_social ? 'selected' : ''}>
            ${o.nombre}
          </option>`).join('')}
      </select>`;

    const selectMotivo = `
      <select id="swal-id_motivo" class="swal2-input">
        ${opciones.motivos.map((m) => `
          <option value="${m.id_motivo}" ${admision.id_motivo === m.id_motivo ? 'selected' : ''}>
            ${m.tipo}
          </option>`).join('')}
      </select>`;

    const selectPersonal = `
      <select id="swal-id_usuario" class="swal2-input">
        <option value="">-</option>
        ${opciones.personal.filter(u => u.datos_medico).map(u => {
          const { apellido, nombre, especialidad } = u.datos_medico;
          const espec = especialidad?.nombre || 'Sin especialidad';
          return `
            <option value="${u.id_usuario}" ${admision.id_usuario === u.id_usuario ? 'selected' : ''}>
              ${apellido}, ${nombre} - ${espec}
            </option>`;
        }).join('')}
      </select>`;

    Swal.fire({
      title: 'Editar Admisión',
      html: `
        ${selectPacientes}
        ${selectObraSocial}
        <input id="swal-num_asociado" class="swal2-input" value="${admision.num_asociado || ''}" placeholder="N° Asociado">
        <input id="swal-fecha_hora_ingreso" type="datetime-local" class="swal2-input"
          value="${admision.fecha_hora_ingreso 
            ? new Date(admision.fecha_hora_ingreso).toISOString().slice(0, 16) 
            : ''}" placeholder="Fecha Ingreso">
        ${selectMotivo}
        <input id="swal-descripcion" class="swal2-input" value="${admision.descripcion || ''}" placeholder="Descripción">
        <input id="swal-fecha_hora_egreso" type="datetime-local" class="swal2-input"
          value="${admision.fecha_hora_egreso 
            ? new Date(admision.fecha_hora_egreso).toISOString().slice(0, 16) 
            : ''}" placeholder="Fecha Egreso (opcional)">
        <input id="swal-motivo_egr" class="swal2-input" value="${admision.motivo_egr || ''}" placeholder="Motivo Egreso">
        ${selectPersonal}
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: () => {
        const fechaIngreso = $('#swal-fecha_hora_ingreso').val();
        const fechaEgreso = $('#swal-fecha_hora_egreso').val();

        if (!fechaIngreso) {
          Swal.showValidationMessage('La fecha de ingreso es obligatoria');
          return false;
        }
        if (fechaEgreso && fechaEgreso < fechaIngreso) {
          Swal.showValidationMessage('La fecha de egreso debe ser posterior a la de ingreso');
          return false;
        }

        const hoy = new Date().toISOString().slice(0, 10);
        const fechaSeleccionada = fechaIngreso.slice(0, 10);
        const esFuturo = fechaSeleccionada > hoy;

        return {
          id_paciente: $('#swal-id_paciente').val(),
          id_obra_social: $('#swal-id_obra_social').val(),
          num_asociado: $('#swal-num_asociado').val(),
          fecha_hora_ingreso: fechaIngreso,
          id_motivo: $('#swal-id_motivo').val(),
          descripcion: $('#swal-descripcion').val(),
          fecha_hora_egreso: fechaEgreso,
          motivo_egr: $('#swal-motivo_egr').val(),
          id_usuario: $('#swal-id_usuario').val() || null,
          id_mov: esFuturo ? 3 : 1
        };
      }
    }).then((result) => {
        if (result.isConfirmed) {
          const datos = {
            ...result.value,
            fecha_hora_ingreso: toUTC(result.value.fecha_hora_ingreso),
            fecha_hora_egreso: result.value.fecha_hora_egreso
              ? toUTC(result.value.fecha_hora_egreso)
              : null,
          };

          fetch(`/api/admisiones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
          })
          .then(() => Swal.fire('Actualizado', 'Admisión modificada', 'success').then(() => location.reload()))
          .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
      }
    });
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar admisión?',
      text: 'Esta acción eliminará la admisión permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/admisiones/${id}`, { method: 'DELETE' })
          .then(() => Swal.fire('Eliminado', 'Admisión eliminada', 'success').then(() => location.reload()))
          .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
      }
    });
  });

  fetch('/api/admisiones')
    .then(res => res.json())
    .then(admisiones => {
      
      dt.clear();

      if (admisiones.length === 0) {
        dt.draw();
        return;
      }

      admisiones.forEach(admision => {
        dt.row.add([
          admision.paciente || '-',
          admision.dni_paciente || '-',
          admision.obra_social || '-',
          admision.num_asociado || '-',
          admision.motivo_ingreso || '-',
          admision.descripcion || '-',
          admision.fecha_ingreso || '-',
          admision.fecha_egreso || '-',
          admision.motivo_egr || '-',
          admision.usuario_asignado || '-',
          `<button class="btn btn-sm btn-primary me-1 edit-btn" data-id="${admision.id_admision}">
            <i class="fas fa-pen"></i></button>
           <button class="btn btn-sm btn-danger delete-btn" data-id="${admision.id_admision}">
            <i class="fas fa-trash"></i></button>`
        ]);
      });

      dt.draw();
    })
    .catch(err => {
      console.error('❌ Error al obtener admisiones:', err);
      Swal.fire('Error', 'No se pudieron cargar las admisiones.', 'error');
    });
});
$('#btn-actualizar-emergencia').click(async () => {
  const { value: dniForm } = await Swal.fire({
    title: 'Fusión de paciente NN',
    html: `
      <input id="dni_emergencia" class="swal2-input" placeholder="DNI temporal (emergencia)">
      <input id="dni_real" class="swal2-input" placeholder="DNI real">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal2-card-style' },
    preConfirm: () => {
      const dni_emergencia = $('#dni_emergencia').val().trim();
      const dni_real = $('#dni_real').val().trim();

      if (!dni_emergencia || !dni_real) {
        Swal.showValidationMessage('Ambos DNI son obligatorios');
        return false;
      }

      return { dni_emergencia, dni_real };
    }
  });

  if (!dniForm) return;

  const { dni_emergencia, dni_real } = dniForm;

  // 1. Verificar que exista el paciente NN
  const nnRes = await fetch(`/api/pacientes/get-nn/${dni_emergencia}`);
  if (!nnRes.ok) {
    return Swal.fire('Error', 'No se encontró un paciente NN con ese DNI.', 'error');
  }

  // 2. Buscar si ya existe un paciente real
  let datosPrecargados = {};
  const realRes = await fetch(`/api/pacientes/get-pac/${dni_real}`);
  if (realRes.ok) {
    const data = await realRes.json();
    datosPrecargados = data.paciente || {};
  }

  // 3. Formulario final con datos precargados si existen
  const { value: datosFinal } = await Swal.fire({
    title: 'Actualizar datos del paciente',
    html: `
      <input id="nombre" class="swal2-input" placeholder="Nombre" value="${datosPrecargados.nombre || ''}">
      <input id="apellido" class="swal2-input" placeholder="Apellido" value="${datosPrecargados.apellido || ''}">
      <input id="fecha_nac" class="swal2-input" type="date" value="${datosPrecargados.fecha_nac?.split('T')[0] || ''}">
      <input id="telefono" class="swal2-input" placeholder="Teléfono" value="${datosPrecargados.telefono || ''}">
      <input id="direccion" class="swal2-input" placeholder="Dirección" value="${datosPrecargados.direccion || ''}">
      <input id="email" class="swal2-input" placeholder="Email" value="${datosPrecargados.email || ''}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'swal2-card-style' },
    preConfirm: () => {
      const nombre = $('#nombre').val().trim();
      const apellido = $('#apellido').val().trim();
      const fecha_nac = $('#fecha_nac').val();
      if (!nombre || !apellido) {
        Swal.showValidationMessage('Nombre y apellido son obligatorios');
        return false;
      }

      return {
        dni_emergencia,
        dni: dni_real,
        nombre,
        apellido,
        fecha_nac,
        telefono: $('#telefono').val().trim(),
        direccion: $('#direccion').val().trim(),
        email: $('#email').val().trim(),
        id_genero: 1,
        id_localidad: 1
      };
    }
  });

  if (!datosFinal) return;

  try {
    const res = await fetch('/api/emergencias/actualizar-emergencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosFinal)
    });

    const json = await res.json();

    if (!res.ok) throw new Error(json.error || 'Error desconocido');
    Swal.fire('Éxito', json.mensaje, 'success').then(() => location.reload());
  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  }
});


