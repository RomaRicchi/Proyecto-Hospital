import { 
	validarTexto
} from './utils/validacionesImput.js'

$(document).ready(function () { 
  const $tabla = $('#tablaMotivoIngreso');
  if (!$tabla.length) return;

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
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
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

  $(document).on('click', '#btnAgregarMotivo button', () => {
    Swal.fire({
      title: 'Agregar Motivo',
      input: 'text',
      inputLabel: 'Tipo de motivo',
      inputPlaceholder: 'Ingrese el tipo',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: tipo => {
        const err = validarTexto(tipo, 'Tipo de motivo', 3, 50);
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
          customClass: {
            popup: 'swal2-card-style'
          },
          preConfirm: tipo => {
            const err = validarTexto(tipo, 'Tipo de motivo', 3, 50);
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

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar motivo?',
      text: 'Esta acción eliminará el motivo permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      customClass: {
        popup: 'swal2-card-style'
      }
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
