import { validarTexto } from './utils/validacionesImput.js';

$(document).ready(() => {
  const $container = $('#tablaRolesContainer');

  async function cargarRoles() {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      renderTabla(data);
    } catch {
      $container.html('<div class="alert alert-danger">No se pudieron cargar los roles</div>');
    }
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

    html += `</tbody></table></div>`;
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

  $(document).on('click', '#btnAgregar', async () => {
    const { isConfirmed, value } = await Swal.fire({
      title: 'Nuevo Rol',
      input: 'text',
      inputLabel: 'Nombre',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: { popup: 'swal2-card-style' },
      preConfirm: (v) => {
        const err = validarTexto(v, 'Nombre');
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }
        return v.trim();
      }
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: value })
      });

      if (res.status === 409) throw new Error('Ya existe ese rol');
      if (!res.ok) throw new Error();

      await Swal.fire('Guardado', 'Rol creado correctamente', 'success');
      cargarRoles();
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo crear', 'error');
    }
  });

  $(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    const actual = $(this).data('nombre');

    const { isConfirmed, value } = await Swal.fire({
      title: 'Editar Rol',
      input: 'text',
      inputValue: actual,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      customClass: { popup: 'swal2-card-style' },
      preConfirm: (v) => {
        const err = validarTexto(v, 'Nombre');
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }
        return v.trim();
      }
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: value })
      });

      if (!res.ok) throw new Error();

      await Swal.fire('Actualizado', 'Rol actualizado', 'success');
      cargarRoles();
    } catch {
      Swal.fire('Error', 'No se pudo actualizar', 'error');
    }
  });

  $(document).on('click', '.delete-btn', async function () {
    const id = $(this).data('id');

    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar rol?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      customClass: { popup: 'swal2-card-style' },
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await Swal.fire('Eliminado', 'Rol eliminado', 'success');
      cargarRoles();
    } catch {
      Swal.fire('Error', 'No se pudo eliminar', 'error');
    }
  });

  cargarRoles();
});
