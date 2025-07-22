import { validarTexto } from './utils/validacionesImput.js';

$(document).ready(function () {
  const $container = $('#tablaEspecialidadesContainer');

  fetch('/api/especialidades')
    .then(r => r.json())
    .then(data => {
      let html = `
        <table id="tablaEspecialidades" class="table table-bordered">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;
      data.forEach(e => {
        html += `
          <tr>
            <td>${e.nombre}</td>
            <td>
              <button class="btn btn-sm btn-warning edit-btn" data-id="${e.id_especialidad}" data-nombre="${e.nombre}">Editar</button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${e.id_especialidad}">Eliminar</button>
            </td>
          </tr>`;
      });
      html += `</tbody></table>`;
      $container.html(html);

      $('#tablaEspecialidades').DataTable();
    })
    .catch(() => {
      $container.html('<div class="alert alert-danger">No se pudieron cargar las especialidades</div>');
    });

  function cargarEspecialidades() {
    fetch('/api/especialidades')
      .then(r => r.json())
      .then(data => renderTabla(data))
      .catch(() => {
        $container.html('<div class="alert alert-danger">No se pudieron cargar las especialidades</div>');
      });
  }

  function renderTabla(data) {
    let html = `
      <div class="mb-3 text-end">
        <button class="btn btn-success" id="btnAgregar">
          <i class="fas fa-plus-circle me-1"></i> Nueva Especialidad
        </button>
      </div>
      <table id="tablaEspecialidades" class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th style="width:150px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    data.forEach(e => {
      html += `
        <tr>
          <td>${e.nombre}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn" data-id="${e.id_especialidad}" data-nombre="${e.nombre}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${e.id_especialidad}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>`;
    });
    html += `</tbody></table>`;
    $container.html(html);

    $('#tablaEspecialidades').DataTable({
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
          ]
      });
    }

  $(document).on('click', '#btnAgregar', () => {
    Swal.fire({
      title: 'Nueva Especialidad',
      input: 'text',
      inputLabel: 'Nombre',
      inputPlaceholder: 'Ej: Pediatría',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: (value) => {
        const error = validarTexto(value, 'Especialidad', 3, 50);
        if (error) {
          Swal.showValidationMessage(error);
          return false;
        }
        return value.trim();
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch('/api/especialidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: result.value })
      })
        .then(res => {
          if (res.status === 409) throw new Error('Ya existe esa especialidad');
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Guardado', 'Especialidad creada', 'success').then(cargarEspecialidades))
        .catch(err => Swal.fire('Error', err.message || 'No se pudo crear', 'error'));
    });
  });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    const nombreActual = $(this).data('nombre');

    Swal.fire({
      title: 'Editar Especialidad',
      input: 'text',
      inputValue: nombreActual,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: (value) => {
        const error = validarTexto(value, 'Especialidad', 3, 50);
        if (error) {
          Swal.showValidationMessage(error);
          return false;
        }
        return value.trim();
      }
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch(`/api/especialidades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: result.value })
      })
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Actualizado', 'Especialidad modificada', 'success').then(cargarEspecialidades))
        .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
    });
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar especialidad?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      },
    }).then(result => {
      if (!result.isConfirmed) return;
      fetch(`/api/especialidades/${id}`, { method: 'DELETE' })
        .then(async res => {
          if (res.status === 409) {
            const data = await res.json();
            throw new Error(data.message || 'Especialidad en uso');
          }
          if (!res.ok) throw new Error('Error inesperado');
          return res.status !== 204 ? res.json() : null;
        })
        .then(() => Swal.fire('Eliminado', 'Especialidad eliminada', 'success').then(cargarEspecialidades))
        .catch(err => Swal.fire('Error', err.message || 'No se pudo eliminar', 'error'));
    });
  });

  cargarEspecialidades();
});
