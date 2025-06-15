$(document).ready(function () {
  const tabla = $('#tablaAdmisiones');

  if (tabla.length) {
    const dt = tabla.DataTable({
      language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
	  destroy: true,
      responsive: true,    // NUEVO: hace la tabla “responsive” y elimina la barra X
      scrollX: false,
      columnDefs: [{ targets: [8], orderable: false, searchable: false }],
    });

    dt.on('draw', function () {
      const noResults = dt.rows({ filter: 'applied' }).data().length === 0;
      $('#btnAgregarAdmision').remove();
      if (noResults) {
        $('#tablaAdmisiones_wrapper').append(`
          <div class="text-center mt-3">
            <button id="btnAgregarAdmision" class="btn btn-success">
              Agregar Nueva Admisión
            </button>
          </div>
        `);
      }
    });
  }

  // Función para obtener opciones asociadas
  async function getOpcionesAdmision() {
    const res = await fetch('/api/admisiones/opciones');
    return await res.json();
  }

  // 🔸 Agregar admisión
  $(document).on('click', '#btnAgregarAdmision', async function () {
    const opciones = await getOpcionesAdmision();

    const selectPacientes = `
      <select id="swal-id_paciente" class="swal2-input">
        <option value="">-- Paciente --</option>
        ${opciones.pacientes
          .map(
            (p) =>
              `<option value="${p.id_paciente}">${p.apellido_p} ${p.nombre_p}</option>`
          )
          .join('')}
      </select>
    `;
    const selectObraSocial = `
      <select id="swal-id_obra_social" class="swal2-input">
        <option value="">-- Obra Social --</option>
        ${opciones.obrasSociales
          .map(
            (o) =>
              `<option value="${o.id_obra_social}">${o.nombre}</option>`
          )
          .join('')}
      </select>
    `;
    const selectMotivo = `
      <select id="swal-id_motivo" class="swal2-input">
        <option value="">-- Motivo --</option>
        ${opciones.motivos
          .map(
            (m) => `<option value="${m.id_motivo}">${m.tipo}</option>`
          )
          .join('')}
      </select>
    `;
    const selectPersonal = `
      <select id="swal-id_personal_salud" class="swal2-input">
        <option value="">-- Personal Salud (opcional) --</option>
        ${opciones.personal
          .map(
            (u) =>
              `<option value="${u.id_usuario}">${u.username}</option>`
          )
          .join('')}
      </select>
    `;

    Swal.fire({
      title: 'Agregar Nueva Admisión',
      html: `
        ${selectPacientes}
        ${selectObraSocial}
        <input id="swal-num_asociado" class="swal2-input" placeholder="N° Asociado">
        ${selectMotivo}
        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>
        <input id="swal-fecha_hora_ingreso" type="datetime-local" class="swal2-input">
        <input id="swal-fecha_hora_egreso" type="datetime-local" class="swal2-input">
        <input id="swal-motivo_egr" class="swal2-input" placeholder="Motivo Egreso">
        ${selectPersonal}
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const id_paciente       = $('#swal-id_paciente').val();
        const id_obra_social    = $('#swal-id_obra_social').val();
        const num_asociado      = $('#swal-num_asociado').val().trim();
        const id_motivo         = $('#swal-id_motivo').val();
        const descripcion       = $('#swal-descripcion').val().trim();
        const fecha_ingreso     = $('#swal-fecha_hora_ingreso').val();
        const fecha_egreso      = $('#swal-fecha_hora_egreso').val();
        const motivo_egr        = $('#swal-motivo_egr').val().trim();
        const id_personal_salud = $('#swal-id_personal_salud').val() || null;

        // Validaciones
        if (!id_paciente) {
          Swal.showValidationMessage('Debes seleccionar un paciente.');
          return false;
        }
        if (!id_obra_social) {
          Swal.showValidationMessage('Debes seleccionar una obra social.');
          return false;
        }
        if (!num_asociado || isNaN(num_asociado)) {
          Swal.showValidationMessage('El N° Asociado es obligatorio y debe ser numérico.');
          return false;
        }
        if (!id_motivo) {
          Swal.showValidationMessage('Debes seleccionar un motivo de admisión.');
          return false;
        }
        if (!descripcion || descripcion.length < 5) {
          Swal.showValidationMessage('La descripción es obligatoria (mínimo 5 caracteres).');
          return false;
        }
        if (!fecha_ingreso) {
          Swal.showValidationMessage('Debes indicar la fecha y hora de ingreso.');
          return false;
        }
        if (fecha_egreso) {
          if (new Date(fecha_egreso) <= new Date(fecha_ingreso)) {
            Swal.showValidationMessage('La fecha de egreso debe ser posterior a la de ingreso.');
            return false;
          }
          if (!motivo_egr || motivo_egr.length < 5) {
            Swal.showValidationMessage('Debe proporcionar un motivo de egreso (mínimo 5 caracteres).');
            return false;
          }
        }

        return {
          id_paciente,
          id_obra_social,
          num_asociado,
          id_motivo,
          descripcion,
          fecha_hora_ingreso: fecha_ingreso,
          fecha_hora_egreso: fecha_egreso || null,
          motivo_egr: motivo_egr || null,
          id_personal_salud,
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('/api/admisiones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(() =>
            Swal.fire('Agregado', 'Admisión creada con éxito', 'success').then(() =>
              location.reload()
            )
          )
          .catch(() => Swal.fire('Error', 'No se pudo crear', 'error'));
      }
    });
  });

  // 🔸 Editar admisión
  $(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    const admision = await fetch(`/api/admisiones/${id}`).then((r) => r.json());
    const opciones = await getOpcionesAdmision();

    // Reutilizamos los mismos selectores HTML, pero con selección de valores
    const selectPacientes = `
      <select id="swal-id_paciente" class="swal2-input">
        <option value="">-- Paciente --</option>
        ${opciones.pacientes
          .map(
            (p) =>
              `<option value="${p.id_paciente}" ${
                admision.id_paciente === p.id_paciente ? 'selected' : ''
              }>${p.apellido_p} ${p.nombre_p}</option>`
          )
          .join('')}
      </select>
    `;
    const selectObraSocial = `
      <select id="swal-id_obra_social" class="swal2-input">
        <option value="">-- Obra Social --</option>
        ${opciones.obrasSociales
          .map(
            (o) =>
              `<option value="${o.id_obra_social}" ${
                admision.id_obra_social === o.id_obra_social ? 'selected' : ''
              }>${o.nombre}</option>`
          )
          .join('')}
      </select>
    `;
    const selectMotivo = `
      <select id="swal-id_motivo" class="swal2-input">
        <option value="">-- Motivo --</option>
        ${opciones.motivos
          .map(
            (m) =>
              `<option value="${m.id_motivo}" ${
                admision.id_motivo === m.id_motivo ? 'selected' : ''
              }>${m.tipo}</option>`
          )
          .join('')}
      </select>
    `;
    const selectPersonal = `
      <select id="swal-id_personal_salud" class="swal2-input">
        <option value="">-- Personal Salud (opcional) --</option>
        ${opciones.personal
          .map(
            (u) =>
              `<option value="${u.id_usuario}" ${
                admision.id_personal_salud === u.id_usuario ? 'selected' : ''
              }>${u.username}</option>`
          )
          .join('')}
      </select>
    `;

    Swal.fire({
      title: 'Editar Admisión',
      html: `
        ${selectPacientes}
        ${selectObraSocial}
        <input id="swal-num_asociado" class="swal2-input" value="${admision.num_asociado || ''}" placeholder="N° Asociado">
        ${selectMotivo}
        <textarea id="swal-descripcion" class="swal2-textarea" placeholder="Descripción">${admision.descripcion || ''}</textarea>
        <input id="swal-fecha_hora_ingreso" type="datetime-local" class="swal2-input" value="${admision.fecha_hora_ingreso ? admision.fecha_hora_ingreso.slice(0,16) : ''}">
        <input id="swal-fecha_hora_egreso" type="datetime-local" class="swal2-input" value="${admision.fecha_hora_egreso ? admision.fecha_hora_egreso.slice(0,16) : ''}">
        <input id="swal-motivo_egr" class="swal2-input" value="${admision.motivo_egr || ''}" placeholder="Motivo Egreso">
        ${selectPersonal}
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const id_paciente       = $('#swal-id_paciente').val();
        const id_obra_social    = $('#swal-id_obra_social').val();
        const num_asociado      = $('#swal-num_asociado').val().trim();
        const id_motivo         = $('#swal-id_motivo').val();
        const descripcion       = $('#swal-descripcion').val().trim();
        const fecha_ingreso     = $('#swal-fecha_hora_ingreso').val();
        const fecha_egreso      = $('#swal-fecha_hora_egreso').val();
        const motivo_egr        = $('#swal-motivo_egr').val().trim();
        const id_personal_salud = $('#swal-id_personal_salud').val() || null;

        // Validaciones (idénticas a las de creación)
        if (!id_paciente) {
          Swal.showValidationMessage('Debes seleccionar un paciente.');
          return false;
        }
        if (!id_obra_social) {
          Swal.showValidationMessage('Debes seleccionar una obra social.');
          return false;
        }
        if (!num_asociado || isNaN(num_asociado)) {
          Swal.showValidationMessage('El N° Asociado es obligatorio y debe ser numérico.');
          return false;
        }
        if (!id_motivo) {
          Swal.showValidationMessage('Debes seleccionar un motivo de admisión.');
          return false;
        }
        if (!descripcion || descripcion.length < 5) {
          Swal.showValidationMessage('La descripción es obligatoria (mínimo 5 caracteres).');
          return false;
        }
        if (!fecha_ingreso) {
          Swal.showValidationMessage('Debes indicar la fecha y hora de ingreso.');
          return false;
        }
        if (fecha_egreso) {
          if (new Date(fecha_egreso) <= new Date(fecha_ingreso)) {
            Swal.showValidationMessage('La fecha de egreso debe ser posterior a la de ingreso.');
            return false;
          }
          if (!motivo_egr || motivo_egr.length < 5) {
            Swal.showValidationMessage('Debe proporcionar un motivo de egreso (mínimo 5 caracteres).');
            return false;
          }
        }

        return {
          id_paciente,
          id_obra_social,
          num_asociado,
          id_motivo,
          descripcion,
          fecha_hora_ingreso: fecha_ingreso,
          fecha_hora_egreso: fecha_egreso || null,
          motivo_egr: motivo_egr || null,
          id_personal_salud,
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/admisiones/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(() =>
            Swal.fire('Actualizado', 'Admisión modificada', 'success').then(() =>
              location.reload()
            )
          )
          .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
      }
    });
  });

  // 🔸 Eliminar admisión
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar admisión?',
      text: 'Esta acción eliminará la admisión permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/admisiones/${id}`, { method: 'DELETE' })
          .then(() =>
            Swal.fire('Eliminado', 'Admisión eliminada', 'success').then(() =>
              location.reload()
            )
          )
          .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
      }
    });
  });
});
