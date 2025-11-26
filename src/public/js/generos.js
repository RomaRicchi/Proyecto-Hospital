import { 
	validarTexto
} from './utils/validacionesImput.js'

$(document).ready(function () {
  const tabla = $('#tablaGenero');
  if (!tabla.length) return;

  fetch('/api/genero')
    .then((response) => response.json())
    .then((generos) => {
      const dataSet = generos.map((gen) => [
        gen.nombre,
        `
          <button class="btn btn-sm btn-primary edit-btn" data-id="${gen.id_genero}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${gen.id_genero}">
            <i class="fas fa-trash"></i>
          </button>
        `
      ]);

      tabla.DataTable({
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
        paging: true,
        pageLength: 10,
        searching: true,
        ordering: true,
        destroy: true,
        responsive: true,
        scrollX: false,
        data: dataSet,
        columns: [
          { title: 'Nombre' },
          { title: 'Acciones', orderable: false, searchable: false }
        ]
      });
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar los géneros.', 'error');
    });

  $(document).on('click', '#btnAgregarGenero', function () {
    Swal.fire({
      title: 'Agregar Género',
      input: 'text',
      inputLabel: 'Nombre del género',
      inputPlaceholder: 'Ingrese el nombre del género',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: (nombre) => {
        const error = validarTexto(nombre, 'Nombre del género', 3, 30);
        if (error) {
          Swal.showValidationMessage(error);
          return false;
        }
        return { nombre: nombre.trim() };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('/api/genero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value)
        })
          .then((res) => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(() =>
            Swal.fire('Guardado', 'Género creado', 'success').then(() =>
              location.reload()
            )
          )
          .catch(() =>
            Swal.fire('Error', 'No se pudo crear el género', 'error')
          );
      }
    });
  });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/genero/${id}`)
      .then((res) => res.json())
      .then((genero) => {
        Swal.fire({
          title: 'Editar Género',
          input: 'text',
          inputLabel: 'Nombre del género',
          inputValue: genero.nombre,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          customClass: {
            popup: 'swal2-card-style'
          },
          preConfirm: (nombre) => {
            const error = validarTexto(nombre, 'Nombre del género', 3, 30);
            if (error) {
              Swal.showValidationMessage(error);
              return false;
            }
            return { nombre: nombre.trim() };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/api/genero/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result.value)
            })
              .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
              })
              .then(() =>
                Swal.fire('Actualizado', 'Género modificado', 'success').then(
                  () => location.reload()
                )
              )
              .catch(() =>
                Swal.fire('Error', 'No se pudo actualizar el género', 'error')
              );
          }
        });
      })
      .catch(() =>
        Swal.fire('Error', 'No se pudo cargar el género para editar', 'error')
      );
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar género?',
      text: 'Esta acción eliminará el género permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/genero/${id}`, { method: 'DELETE' })
          .then((res) => {
            if (!res.ok) throw new Error();
          })
          .then(() =>
            Swal.fire('Eliminado', 'Género eliminado', 'success').then(() =>
              location.reload()
            )
          )
          .catch(() =>
            Swal.fire('Error', 'No se pudo eliminar el género', 'error')
          );
      }
    });
  });
});
