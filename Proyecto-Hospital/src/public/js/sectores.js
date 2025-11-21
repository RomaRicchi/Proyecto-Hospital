import { validarTexto } from './utils/validacionesImput.js';

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
            <button class="btn btn-sm btn-danger btn-eliminar-sector" data-id="${sec.id_sector}">
              <i class="fas fa-trash"></i>
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

  $(document).on('click', '#btnAgregarSector', () => {
    Swal.fire({
      title: 'Nuevo Sector',
      input: 'text',
      inputLabel: 'Nombre',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
					popup: 'swal2-card-style'
				},
      preConfirm: (v) => {
        const error = validarTexto(v, 'Nombre del sector');
        if (error) {
          Swal.showValidationMessage(error);
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
          customClass: {
					  popup: 'swal2-card-style'
				  },
          preConfirm: (v) => {
            const error = validarTexto(v, 'Nombre del sector');
            if (error) {
              Swal.showValidationMessage(error);
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

  $(document).on('click', '.btn-eliminar-sector', async function () {
    const id = $(this).data('id');
    if (!id) return;

    const confirmar = await Swal.fire({
      title: '¿Eliminar Sector?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      }
    });

    if (!confirmar.isConfirmed) return;

    try {
      const resp = await fetch(`/api/sectores/${id}`, {
        method: 'DELETE',
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message || 'No se pudo eliminar');
      }

      await Swal.fire('Eliminado', 'Sector eliminado correctamente', 'success');
      cargarSectores(); // actualiza tabla
    } catch (err) {
      await Swal.fire('Error', err.message || 'Error al eliminar', 'error');
    }
  });

  cargarSectores();
});
