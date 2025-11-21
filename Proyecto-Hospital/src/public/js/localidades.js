$(document).ready(function () {
  const $tabla = $('#tablaLocalidades');
  if (!$tabla.length) return;

  function validarLocalidad(nombre) {
    if (!nombre || !nombre.trim()) {
      return 'El nombre de la localidad es obligatorio.';
    }
    const trimmed = nombre.trim();
    if (trimmed.length < 3 || trimmed.length > 50) {
      return 'El nombre debe tener entre 3 y 50 caracteres.';
    }
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ \-]+$/.test(trimmed)) {
      return 'El nombre solo puede contener letras, espacios y guiones.';
    }

    return null;
  }

  fetch('/api/localidades')
    .then(r => r.json())
    .then(localidades => {
      const dataSet = localidades.map(loc => [
        loc.nombre,
        `
          <button class="btn btn-sm btn-primary edit-btn" data-id="${loc.id_localidad}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${loc.id_localidad}">
            <i class="fas fa-trash"></i>
          </button>
        `
      ]);

      const dt = $tabla.DataTable({
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }, 
        paging: true,
        pageLength: 10,
        searching: true,
        ordering: true,
        data: dataSet,
	      destroy: true,
        responsive: true,
		    scrollX: false,
        columns: [
          { title: 'Nombre' },
          { title: 'Acciones', orderable: false, searchable: false }
        ]
      });

      dt.on('draw', () => {
        $('#btnAgregarLocalidad').remove();
        if (dt.rows({ filter: 'applied' }).data().length === 0) {
          $('#tablaLocalidades_wrapper').append(`
            <div id="btnAgregarLocalidad" class="text-center mt-3">
              <button class="btn btn-success">
                <i class="fas fa-plus-circle me-1"></i> Agregar Nueva Localidad
              </button>
            </div>
          `);
        }
      });
      dt.draw(); 
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar las localidades.', 'error');
    });

  $(document).on('click', '#btnAgregarLocalidad button', () => {
    Swal.fire({
      title: 'Agregar Localidad',
      input: 'text',
      inputLabel: 'Nombre de la localidad',
      inputPlaceholder: 'Ingrese el nombre de la localidad',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: (nombre) => {
        const error = validarLocalidad(nombre);
        if (error) {
          Swal.showValidationMessage(error);
          return false;
        }
        return { nombre: nombre.trim() };
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch('/api/localidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      })
      .then(res => {
        if (res.status === 409) throw new Error('Ya existe esa localidad.');
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() =>
        Swal.fire('Guardado', 'Localidad creada', 'success').then(() => location.reload())
      )
      .catch(err =>
        Swal.fire('Error', err.message || 'No se pudo crear la localidad', 'error')
      );
    });
  });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/localidades/${id}`)
      .then(r => r.json())
      .then(localidad => {
        Swal.fire({
          title: 'Editar Localidad',
          input: 'text',
          inputLabel: 'Nombre de la localidad',
          inputValue: localidad.nombre,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          customClass: {
            popup: 'swal2-card-style'
          },
          preConfirm: (nombre) => {
            const error = validarLocalidad(nombre);
            if (error) {
              Swal.showValidationMessage(error);
              return false;
            }
            return { nombre: nombre.trim() };
          }
        }).then(result => {
          if (!result.isConfirmed) return;
          fetch(`/api/localidades/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          })
          .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(() =>
            Swal.fire('Actualizado', 'Localidad modificada', 'success').then(() => location.reload())
          )
          .catch(() =>
            Swal.fire('Error', 'No se pudo actualizar la localidad', 'error')
          );
        });
      })
      .catch(() => {
        Swal.fire('Error', 'No se pudo cargar la localidad.', 'error');
      });
  });

  // 4) Eliminar localidad
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar localidad?',
      text: 'Esta acción eliminará la localidad permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch(`/api/localidades/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.status === 409) throw new Error('No se puede eliminar: en uso.');
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() =>
          Swal.fire('Eliminado', 'Localidad eliminada', 'success').then(() => location.reload())
        )
        .catch(err =>
          Swal.fire('Error', err.message || 'No se pudo eliminar la localidad', 'error')
        );
    });
  });
});
