import { validarTexto } from './utils/validacionesImput.js';

$(document).ready(function () {
  const tabla = $('#tablaObraSocial');
  if (!tabla.length) return;

  fetch('/api/obras-sociales')
    .then((response) => response.json())
    .then((obras) => {
      const dataSet = obras.map((obra) => [
        obra.nombre,
        `
        <button class="btn btn-sm btn-primary edit-btn" data-id="${obra.id_obra_social}">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${obra.id_obra_social}">
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
        const info = dataTable.page.info();
        if (info.recordsDisplay === 0 && !$('#btnAgregarObraSocial').length) {
          $('#tablaObraSocial_wrapper').append(`
            <div class="text-center mt-3">
              <button id="btnAgregarObraSocial" class="btn btn-success">
                Agregar Nueva Obra Social
              </button>
            </div>
          `);
        } else {
          $('#btnAgregarObraSocial').remove();
        }
      });
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar las obras sociales.', 'error');
    });

  $(document).on('click', '#btnAgregarObraSocial', function () {
    Swal.fire({
      title: 'Agregar Obra Social',
      input: 'text',
      inputLabel: 'Nombre de la obra social',
      inputPlaceholder: 'Ingrese el nombre',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: (nombre) => {
        const err = validarTexto(nombre, 'Nombre', 3, 50);
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }
        return { nombre: nombre.trim() };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('/api/obras-sociales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(() => Swal.fire('Guardado', 'Obra social creada', 'success').then(() => location.reload()))
          .catch(() => Swal.fire('Error', 'No se pudo crear la obra social', 'error'));
      }
    });
  });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/obras-sociales/${id}`)
      .then((res) => res.json())
      .then((obra) => {
        Swal.fire({
          title: 'Editar Obra Social',
          input: 'text',
          inputLabel: 'Nombre de la obra social',
          inputValue: obra.nombre,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          customClass: {
            popup: 'swal2-card-style'
          },
          preConfirm: (nombre) => {
            const err = validarTexto(nombre, 'Nombre', 3, 50);
            if (err) {
              Swal.showValidationMessage(err);
              return false;
            }
            return { nombre: nombre.trim() };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/api/obras-sociales/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result.value),
            })
              .then(() => Swal.fire('Actualizado', 'Obra social modificada', 'success').then(() => location.reload()))
              .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
          }
        });
      });
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar obra social?',
      text: 'Esta acción eliminará la obra social permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/obras-sociales/${id}`, { method: 'DELETE' })
          .then(() => Swal.fire('Eliminado', 'Obra social eliminada', 'success').then(() => location.reload()))
          .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
      }
    });
  });
});
