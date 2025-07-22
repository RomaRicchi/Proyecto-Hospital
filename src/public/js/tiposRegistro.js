import { 
	validarTexto
} from './utils/validacionesImput.js';

$(document).ready(function () {
  const $c = $('#tablaTiposContainer');

  function cargar() {
    fetch('/api/tipos-registro')
      .then(r => r.json())
      .then(d => render(d))
      .catch(() => $c.html('<div class="alert alert-danger">No se pudieron cargar los tipos</div>'));
  }

  function render(arr) {
    let html = `
      <div class="mb-3 text-end">
        <button class="btn btn-success" id="btnAdd">
          <i class="fas fa-plus-circle me-1"></i> Nuevo Tipo
        </button>
      </div>
      <table id="tablaTipos" class="table table-bordered table-striped table-hover">
        <thead><tr><th>Nombre</th><th style="width:150px;">Acciones</th></tr></thead>
        <tbody>
    `;
    arr.forEach(t => {
      html += `
        <tr>
          <td>${t.nombre}</td>
          <td>
            <button class="btn btn-warning btn-sm edit" data-id="${t.id_tipo}" data-desc="${t.nombre}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm del" data-id="${t.id_tipo}"><i class="fas fa-trash-alt"></i></button>
          </td>
        </tr>`;
    });

    html += '</tbody></table>';
    $c.html(html);
    $('#tablaTipos').DataTable({
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
      ],
    });
  }

  $(document).on('click', '#btnAdd', () => {
    Swal.fire({
      title: 'Nuevo Tipo',
      input: 'text',
      inputLabel: 'Nombre',
      showCancelButton: true,
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: v => {
        const e = validarTexto(v, 'Nombre', 3);
        if (e) {
          Swal.showValidationMessage(e);
          return false;
        }
        return v.trim();
      }
    }).then(r => {
      if (!r.isConfirmed) return;
      fetch('/api/tipos-registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: r.value })
      })
        .then(res => {
          if (res.status === 409) throw new Error('Ya existe');
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() => Swal.fire('Guardado', '', 'success').then(cargar))
        .catch(e => Swal.fire('Error', e.message || 'No se pudo crear', 'error'));
    });
  });

  $(document).on('click', '.edit', function () {
    const id = $(this).data('id'); const desc = $(this).data('desc');
    Swal.fire({
      title: 'Editar Tipo',
      input: 'text',
      inputValue: desc,
      showCancelButton: true,
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: v => {
        const e = validarTexto(v, 'Nombre', 3);
        if (e) {
          Swal.showValidationMessage(e);
          return false;
        }
        return v.trim();
      }
    }).then(r => {
      if (!r.isConfirmed) return;
      fetch(`/api/tipos-registro/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: r.value })
      })
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(() => Swal.fire('Actualizado', '', 'success').then(cargar))
        .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
    });
  });

  $(document).on('click', '.del', function () {
    const id = $(this).data('id');
    Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar' })
      .then(r => {
        if (!r.isConfirmed) return;
        fetch(`/api/tipos-registro/${id}`, { method: 'DELETE' })
          .then(res => {
            if (res.status === 409) throw new Error('En uso por registros clínicos');
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(() => Swal.fire('Eliminado', '', 'success').then(cargar))
          .catch(e => Swal.fire('Error', e.message || 'No se pudo eliminar', 'error'));
      });
  });

  cargar();
});
