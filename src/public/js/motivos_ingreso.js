$(document).ready(function () { 
  const $tabla = $('#tablaMotivoIngreso');
  if (!$tabla.length) return;

  // 🔍 Validación para el campo "Tipo": 3–50 caracteres, sólo letras y espacios
  function validarTipo(tipo) {
    if (!tipo || !tipo.trim()) {
      return 'El tipo de motivo es obligatorio.';
    }
    const txt = tipo.trim();
    if (txt.length < 3 || txt.length > 50) {
      return 'El tipo debe tener entre 3 y 50 caracteres.';
    }
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(txt)) {
      return 'El tipo solo puede contener letras y espacios.';
    }
    return null;
  }

  // 🟡 Inicializar DataTable sin columna ID
  fetch('/api/motivos_ingreso')
    .then(r => r.json())
    .then(motivos => {
      const dataSet = motivos.map(m => [
        m.tipo,
        `
          <button class="btn btn-sm btn-primary edit-btn" data-id="${m.id_motivo}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${m.id_motivo}">
            <i class="fas fa-trash"></i>
          </button>
        `
      ]);

      const dt = $tabla.DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
        paging: true,
        pageLength: 10,
        searching: true,
        ordering: true,  
		    destroy: true,
        responsive: true,
		    scrollX: false,
        columns: [
          { title: 'Tipo' },
          { title: 'Acciones', orderable: false, searchable: false }
        ]
      });

      // Mostrar botón Agregar si no hay filas
      dt.on('draw', () => {
        $('#btnAgregarMotivo').remove();
        if (dt.rows({ filter: 'applied' }).data().length === 0) {
          $('#tablaMotivoIngreso_wrapper').append(`
            <div id="btnAgregarMotivo" class="text-center mt-3">
              <button class="btn btn-success">
                <i class="fas fa-plus-circle me-1"></i> Agregar Nuevo Motivo
              </button>
            </div>
          `);
        }
      });

      dt.draw();
    })
    .catch(() => Swal.fire('Error', 'No se pudo cargar los motivos.', 'error'));

  // 🟢 Agregar Motivo
  $(document).on('click', '#btnAgregarMotivo button', () => {
    Swal.fire({
      title: 'Agregar Motivo',
      input: 'text',
      inputLabel: 'Tipo de motivo',
      inputPlaceholder: 'Ingrese el tipo',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: tipo => {
        const err = validarTipo(tipo);
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }
        return { tipo: tipo.trim() };
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch('/api/motivos_ingreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      })
      .then(res => {
        if (res.status === 409) throw new Error('El motivo ya existe.');
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => Swal.fire('Guardado', 'Motivo creado', 'success').then(() => location.reload()))
      .catch(err => Swal.fire('Error', err.message || 'No se pudo crear el motivo', 'error'));
    });
  });

  // 🟠 Editar Motivo
  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/motivos_ingreso/${id}`)
      .then(r => r.json())
      .then(m => {
        Swal.fire({
          title: 'Editar Motivo',
          input: 'text',
          inputLabel: 'Tipo de motivo',
          inputValue: m.tipo,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          preConfirm: tipo => {
            const err = validarTipo(tipo);
            if (err) {
              Swal.showValidationMessage(err);
              return false;
            }
            return { tipo: tipo.trim() };
          }
        }).then(result => {
          if (!result.isConfirmed) return;
          fetch(`/api/motivos_ingreso/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          })
          .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(() => Swal.fire('Actualizado', 'Motivo modificado', 'success').then(() => location.reload()))
          .catch(() => Swal.fire('Error', 'No se pudo actualizar el motivo', 'error'));
        });
      })
      .catch(() => Swal.fire('Error', 'No se pudo cargar el motivo.', 'error'));
  });

  // 🔴 Eliminar Motivo
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar motivo?',
      text: 'Esta acción eliminará el motivo permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch(`/api/motivos_ingreso/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.status === 409) throw new Error('No se puede eliminar: en uso.');
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Eliminado', 'Motivo eliminado', 'success').then(() => location.reload()))
        .catch(err => Swal.fire('Error', err.message || 'No se pudo eliminar el motivo', 'error'));
    });
  });
});
