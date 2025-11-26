import { validarNumeroPositivo } from './utils/validacionesImput.js';

$(document).ready(function () {
  const $tabla = $('#tablaHabitacion');
  if (!$tabla.length) return;


  const dt = $tabla.DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    paging: true,
    pageLength: 10,
    searching: true,
    ordering: true,  
		destroy: true,
    responsive: true,
		scrollX: false,
    columnDefs: [{ targets: 3, orderable: false, searchable: false }],
  });

  function toggleAddButton() {
    $('#btnAgregarHabitacion').remove();

    const $btn = $(`
      <div id="btnAgregarHabitacion" class="text-end mb-3">
        <button class="btn btn-success">
          <i class="fas fa-plus-circle me-1"></i> Agregar Habitación
        </button>
      </div>
    `);

    $('#tablaHabitacion_wrapper').prepend($btn);
  }

  dt.on('draw', toggleAddButton);
  toggleAddButton();

  $(document).on('click', '#btnAgregarHabitacion button', async function () {
    try {
      const sectores = await fetch('/api/sectores').then((r) => r.json());
      const sectorOptions = sectores
        .map((s) => `<option value="${s.id_sector}">${s.nombre}</option>`)
        .join('');

      Swal.fire({
        title: 'Agregar Habitación',
        html: `
          <input id="swal-num" class="swal2-input" placeholder="Número">
          <select id="swal-sector" class="swal2-input">
            <option value="">Sector</option>
            ${sectorOptions}
          </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        customClass: {
          popup: 'swal2-card-style'
        },
        preConfirm: () => {
          const num = $('#swal-num').val().trim();
          const id_sector = $('#swal-sector').val();
          const error = validarNumeroPositivo(num, 'Número de habitación');
          if (error) {
            Swal.showValidationMessage(error);
            return false;
          }
          return { num, id_sector: id_sector || null };
        },
      }).then((result) => {
        if (!result.isConfirmed) return;
        fetch('/api/habitaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(async res => {
            if (res.status === 409) {
              const error = await res.json();
              throw new Error(error.message || 'Conflicto: habitación duplicada');
            }
            if (!res.ok) throw new Error('Error al crear');
            return res.json();
          })
          .then(() =>
            Swal.fire('Agregado', 'Habitación creada', 'success').then(() =>
              location.reload()
            )
          )
          .catch((err) =>
            Swal.fire('Error', err.message || 'No se pudo crear', 'error')
          );
      });
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los sectores.', 'error');
    }
  });

  $(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    try {
      const [habitacion, sectores] = await Promise.all([
        fetch(`/api/habitaciones/${id}`).then((r) => r.json()),
        fetch('/api/sectores').then((r) => r.json()),
      ]);
      const sectorOptions = sectores
        .map(
          (s) =>
            `<option value="${s.id_sector}" ${
              habitacion.id_sector == s.id_sector ? 'selected' : ''
            }>${s.nombre}</option>`
        )
        .join('');
      Swal.fire({
        title: 'Editar Habitación',
        html: `
          <input id="swal-num" class="swal2-input" placeholder="Número" value="${habitacion.num}">
          <select id="swal-sector" class="swal2-input">
            <option value="">Sector</option>
            ${sectorOptions}
          </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        customClass: {
          popup: 'swal2-card-style'
        },
        preConfirm: () => {
          const num = $('#swal-num').val().trim();
          const id_sector = $('#swal-sector').val();
          const error = validarNumeroPositivo(num, 'Número de habitación');
          if (error) {
            Swal.showValidationMessage(error);
            return false;
          }
          return { num, id_sector: id_sector || null };
        },
      }).then((result) => {
        if (!result.isConfirmed) return;
        fetch(`/api/habitaciones/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(async res => {
            if (res.status === 409) {
              const error = await res.json();
              throw new Error(error.message || 'Conflicto: habitación duplicada');
            }
            if (!res.ok) throw new Error('Error al actualizar');
            return res.json();
          })

          .then(() =>
            Swal.fire('Actualizado', 'Habitación modificada', 'success').then(() =>
              location.reload()
            )
          )
          .catch((err) =>
            Swal.fire('Error', err.message || 'No se pudo actualizar', 'error')
          );
      });
    } catch {
      Swal.fire('Error', 'No se pudo cargar la habitación.', 'error');
    }
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar habitación?',
      text: 'Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      customClass: {
        popup: 'swal2-card-style'
      },
    }).then((result) => {
      if (!result.isConfirmed) return;
      fetch(`/api/habitaciones/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (res.status === 409) throw new Error('No se puede eliminar: en uso.');
          if (!res.ok) throw new Error();
          // Si no hay contenido, no intentes parsear JSON
          return res.status !== 204 ? res.json() : null;
        })
        .then(() =>
          Swal.fire('Eliminado', 'Habitación borrada', 'success').then(() =>
            location.reload()
          )
        )
        .catch((err) =>
          Swal.fire('Error', err.message || 'No se pudo eliminar', 'error')
        );
    });
  });

});
