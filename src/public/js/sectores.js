$(document).ready(function () {
  const $container = $('#tablaSectorContainer');

  function cargarSectores() {
    fetch('/api/sectores')
      .then(r => r.json())
      .then(data => renderTabla(data))
      .catch(() => {
        $container.html('<div class="alert alert-danger">No se pudieron cargar los sectores</div>');
      });
  }

  function renderTabla(data) {
    let html = `
      <div class="mb-3 text-end">
        <button class="btn btn-success" id="btnAgregarSector">
          <i class="fas fa-plus-circle me-1"></i> Agregar Nuevo Sector
        </button>
      </div>
      <div class="table-responsive">
        <table id="tablaSector" class="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th style="width:150px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach(sec => {
      html += `
        <tr>
          <td>${sec.nombre}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn" data-id="${sec.id_sector}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${sec.id_sector}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    $container.html(html);

    $('#tablaSector').DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      destroy: true,
      columns: [
        { title: 'Nombre' },
        { title: 'Acciones', orderable: false, searchable: false }
      ]
    });
  }

  // Agregar sector
  $(document).on('click', '#btnAgregarSector', () => {
    Swal.fire({
      title: 'Nuevo Sector',
      input: 'text',
      inputLabel: 'Nombre',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: (v) => {
        if (!v || v.trim().length < 3) {
          Swal.showValidationMessage('Debe ingresar al menos 3 letras');
          return false;
        }
        return v.trim();
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch('/api/sectores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: result.value })
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Guardado', 'Sector creado correctamente', 'success').then(cargarSectores))
        .catch(err => Swal.fire('Error', err.message || 'No se pudo crear', 'error'));
    });
  });

  // Editar sector
  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/sectores/${id}`)
      .then(res => res.json())
      .then(sector => {
        Swal.fire({
          title: 'Editar Sector',
          input: 'text',
          inputValue: sector.nombre,
          showCancelButton: true,
          confirmButtonText: 'Actualizar',
          preConfirm: (v) => {
            if (!v || v.trim().length < 3) {
              Swal.showValidationMessage('Debe ingresar al menos 3 letras');
              return false;
            }
            return v.trim();
          }
        }).then(result => {
          if (!result.isConfirmed) return;
          fetch(`/api/sectores/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: result.value })
          })
            .then(res => {
              if (!res.ok) throw new Error();
              return res.json();
            })
            .then(() => Swal.fire('Actualizado', 'Sector actualizado', 'success').then(cargarSectores))
            .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
        });
      });
  });

  // Eliminar sector
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar sector?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch(`/api/sectores/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Eliminado', 'Sector eliminado', 'success').then(cargarSectores))
        .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
    });
  });

  cargarSectores();
});
