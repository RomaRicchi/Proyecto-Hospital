$(document).ready(function () {
  const $tabla = $('#tablaHabitacion');
  if (!$tabla.length) return;

  // Validación para el campo "Número": entero positivo, hasta 4 dígitos
  function validarNumero(num) {
    if (!num) return 'El número es obligatorio.';
    if (!/^[1-9]\d{0,3}$/.test(num)) {
      return 'El número debe ser un entero positivo (1–9999).';
    }
    return null;
  }

  // 1) Inicializar DataTable
  const dt = $tabla.DataTable({
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
    },
    	paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,  
		  destroy: true,
      responsive: true,
		  scrollX: false,
    columnDefs: [{ targets: 3, orderable: false, searchable: false }],
  });

  // 2) Función para mostrar el botón "Agregar" cuando la tabla esté vacía
  function toggleAddButton() {
    // Borra instancias previas
    $('#btnAgregarHabitacion').remove();

    // Si no hay filas, lo mostramos
    if (dt.rows({ filter: 'applied' }).data().length === 0) {
      const $btn = $(`
        <div id="btnAgregarHabitacion" class="text-center mt-3">
          <button class="btn btn-success">
            <i class="fas fa-plus-circle me-1"></i> Agregar Habitación
          </button>
        </div>
      `);
      // Insertar debajo de la tabla, dentro del wrapper de DataTables
      $('#tablaHabitacion_wrapper').append($btn);
    }
  }

  // 3) Ejecutar al dibujar y al iniciar
  dt.on('draw', toggleAddButton);
  toggleAddButton();

  // 4) Click en el botón dinámico "Agregar Habitación"
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
        preConfirm: () => {
          const num = $('#swal-num').val().trim();
          const id_sector = $('#swal-sector').val();
          const error = validarNumero(num);
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
          .then((res) => {
            if (res.status === 409) throw new Error('Ya existe una habitación con este número.');
            if (!res.ok) throw new Error();
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

  // 5) Botón Editar
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
        preConfirm: () => {
          const num = $('#swal-num').val().trim();
          const id_sector = $('#swal-sector').val();
          const error = validarNumero(num);
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
          .then((res) => {
            if (res.status === 409) throw new Error('Ya existe una habitación con este número.');
            if (!res.ok) throw new Error();
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

  // 6) Botón Eliminar
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar habitación?',
      text: 'Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (!result.isConfirmed) return;
      fetch(`/api/habitaciones/${id}`, { method: 'DELETE' })
        .then((res) => {
          if (res.status === 409) throw new Error('No se puede eliminar: en uso.');
          if (!res.ok) throw new Error();
          return res.json();
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
