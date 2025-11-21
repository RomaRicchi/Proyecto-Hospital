import { 
	validarTexto
} from './utils/validacionesImput.js'

$(document).ready(function () {
  const tabla = $('#tablaMovimiento');
  if (!tabla.length) return;

  fetch('/api/movimientos')
    .then((res) => res.json())
    .then((movimientos) => {
      const dataSet = movimientos.map((m) => [
        m.nombre,
        `
        <button class="btn btn-sm btn-primary edit-btn" data-id="${m.id_mov}">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${m.id_mov}">
          <i class="fas fa-trash"></i>
        </button>
        `
      ]);

      const dataTable = tabla.DataTable({
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
        paging: true,
        pageLength: 10,
        searching: true,
        ordering: true,  
		    destroy: true,
        responsive: true,
		    scrollX: false,
        columns: [
          { title: 'Nombre' },
          { title: 'Acciones', orderable: false, searchable: false }
        ]
      });

      dataTable.on('draw', function () {
        $('#btnAgregarMovimiento').remove();
        if (dataTable.rows({ filter: 'applied' }).data().length === 0) {
          $('#tablaMovimiento_wrapper').append(`
            <div class="text-center mt-3" id="btnAgregarMovimiento">
              <button class="btn btn-success">
                <i class="fas fa-plus-circle me-1"></i> Agregar Nuevo Movimiento
              </button>
            </div>
          `);
        }
      });

      dataTable.draw();
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar los movimientos.', 'error');
    });

  $(document).on('click', '#btnAgregarMovimiento button', function () {
    Swal.fire({
      title: 'Agregar Movimiento',
      input: 'text',
      inputLabel: 'Nombre del movimiento',
      inputPlaceholder: 'Ingrese el nombre',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
					popup: 'swal2-card-style'
			},
      preConfirm: (nombre) => {
        const err = validarTexto(nombre, 'Nombre del movimiento', 3, 50);
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }
        return { nombre: nombre.trim() };
      }
    }).then((result) => {
      if (!result.isConfirmed) return;
      fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      })
        .then(() => Swal.fire('Guardado', 'Movimiento creado', 'success').then(() => location.reload()))
        .catch(() => Swal.fire('Error', 'No se pudo crear el movimiento', 'error'));
    });
  });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/movimientos/${id}`)
      .then((res) => res.json())
      .then((m) => {
        Swal.fire({
          title: 'Editar Movimiento',
          input: 'text',
          inputValue: m.nombre,
          inputLabel: 'Nombre del movimiento',
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          customClass: {
            popup: 'swal2-card-style'
          },
          preConfirm: (nombre) => {
            const err = validarTexto(nombre, 'Nombre del movimiento', 3, 50);
            if (err) {
              Swal.showValidationMessage(err);
              return false;
            }
            return { nombre: nombre.trim() };
          }
        }).then((result) => {
          if (!result.isConfirmed) return;
          fetch(`/api/movimientos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          })
            .then(() => Swal.fire('Actualizado', 'Movimiento modificado', 'success').then(() => location.reload()))
            .catch(() => Swal.fire('Error', 'No se pudo actualizar el movimiento', 'error'));
        });
      })
      .catch(() => Swal.fire('Error', 'No se pudo cargar el movimiento.', 'error'));
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar movimiento?',
      text: 'Esta acción eliminará el movimiento permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
					popup: 'swal2-card-style'
				},
    }).then((result) => {
      if (!result.isConfirmed) return;
      fetch(`/api/movimientos/${id}`, { method: 'DELETE' })
        .then(() => Swal.fire('Eliminado', 'Movimiento eliminado', 'success').then(() => location.reload()))
        .catch(() => Swal.fire('Error', 'No se pudo eliminar el movimiento', 'error'));
    });
  });
});
