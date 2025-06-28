$(document).ready(function () {
  const $container = $('#tablaRolesContainer');

  function cargarRoles() {
    fetch('/api/roles')
      .then(r => r.json())
      .then(data => renderTabla(data))
      .catch(() => {
        $container.html('<div class="alert alert-danger">No se pudieron cargar los roles');
      });
  }

  function renderTabla(data) {
    let html = `
      <div class="mb-3 text-end">
        <button class="btn btn-success" id="btnAgregar">
          <i class="fas fa-plus-circle me-1"></i> Nuevo Rol
        </button>
      </div>
      <div class="table-responsive">
        <table id="tablaRoles" class="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th style="width:150px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;


    data.forEach(r => {
      html += `
        <tr>
          <td>${r.nombre}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn" data-id="${r.id_rol_usuario}" data-nombre="${r.nombre}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${r.id_rol_usuario}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    $container.html(html);
    $('#tablaRoles').DataTable({ 
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
				    { title: 'Acciones', orderable: false, searchable: false },
		    ],
    });
  }

  $(document).on('click', '#btnAgregar', () => {
    Swal.fire({
      title: 'Nuevo Rol',
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
      fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: result.value })
      })
        .then(res => {
          if (res.status === 409) throw new Error('Ya existe ese rol');
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Guardado', 'Rol creado correctamente', 'success').then(cargarRoles))
        .catch(err => Swal.fire('Error', err.message || 'No se pudo crear', 'error'));
    });
  });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    const actual = $(this).data('nombre');

    Swal.fire({
      title: 'Editar Rol',
      input: 'text',
      inputValue: actual,
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
      fetch(`/api/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: result.value })
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Actualizado', 'Rol actualizado', 'success').then(cargarRoles))
        .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
    });
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar rol?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch(`/api/roles/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Eliminado', 'Rol eliminado', 'success').then(cargarRoles))
        .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
    });
  });



  cargarRoles();
});
