$(document).ready(function () {
  const tabla = $('#tablaCamas');

  if (tabla.length) {
    const dt = tabla.DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
      destroy: true,
      responsive: true,
      scrollX: false,
      columnDefs: [
        { targets: [4], orderable: false, searchable: false }
      ]
    });

    dt.on('draw', function () {
      $('#btnAgregarCama').remove();
      $('#tablaCamas_wrapper').prepend(`
        <div id="btnAgregarCama" class="text-end mb-3">
          <button class="btn btn-success">
            <i class="fas fa-plus-circle me-1"></i> Agregar Nueva Cama
          </button>
        </div>
      `);
    });
  }

  $(document).on('click', '#btnAgregarCama', async function () {
    const habitaciones = await cargarHabitaciones();
    const habitacionesPorSector = {};
    habitaciones.forEach(h => {
      const sector = h.sector?.nombre || 'Sin sector';
      if (!habitacionesPorSector[sector]) habitacionesPorSector[sector] = [];
      habitacionesPorSector[sector].push(h);
    });

    Swal.fire({
      title: 'Agregar Nueva Cama',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre (1 letra)" style="text-align:center;">
        
        <label class="mt-2 text-start d-block"><strong>Sector:</strong></label>
        <select id="swal-sector" class="swal2-input">
          <option disabled selected value="">Seleccionar sector</option>
          ${Object.keys(habitacionesPorSector).map(sector => `
            <option value="${sector}">${sector}</option>`).join('')}
        </select>

        <label class="mt-2 text-start d-block"><strong>Habitación:</strong></label>
        <select id="swal-id_habitacion" class="swal2-input" disabled>
          <option value="">Seleccionar una habitación</option>
        </select>

        <label class="mt-2 text-start d-block"><strong>Desinfección ok:</strong></label>
        <select id="swal-desinfeccion" class="swal2-input">
          <option value="0">No</option>
          <option value="1">Sí</option>
        </select>

        <label class="mt-2 text-start d-block"><strong>Estado:</strong></label>
        <select id="swal-estado" class="swal2-input">
          <option value="0">Disponible</option>
          <option value="1">Ocupada</option>
        </select>
      `,
      customClass: { popup: 'swal2-card-style' },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      didOpen: () => {
        const selectSector = document.getElementById('swal-sector');
        const selectHabitacion = document.getElementById('swal-id_habitacion');

        selectSector.addEventListener('change', function () {
          const sectorSeleccionado = this.value;
          const habitacionesFiltradas = habitacionesPorSector[sectorSeleccionado] || [];

          selectHabitacion.innerHTML = '<option value="">Seleccionar una habitación</option>';
          habitacionesFiltradas.forEach(h => {
            const option = document.createElement('option');
            option.value = h.id_habitacion;
            option.textContent = `Hab. ${h.num}`;
            selectHabitacion.appendChild(option);
          });

          selectHabitacion.disabled = habitacionesFiltradas.length === 0;
        });
      },
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value.trim().toUpperCase();
        const id_habitacion = document.getElementById('swal-id_habitacion').value;
        const desinfeccion = document.getElementById('swal-desinfeccion').value;
        const estado = document.getElementById('swal-estado').value;

        if (!/^[A-Z]$/.test(nombre)) {
          Swal.showValidationMessage('El nombre debe ser una sola letra (A–Z).');
          return false;
        }
        if (!id_habitacion) {
          Swal.showValidationMessage('Debes seleccionar una habitación.');
          return false;
        }

        return { nombre, id_habitacion, desinfeccion, estado };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('/api/camas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(async (response) => {
            if (response.status === 409) {
              const error = await response.json();
              throw new Error(error.message || 'Ya existe una cama con ese nombre');
            }
            if (!response.ok) throw new Error('Error al crear la cama');
            return response.json();
          })
          .then(() =>
            Swal.fire('Agregado', 'Cama creada con éxito', 'success').then(() =>
              location.reload()
            )
          )
          .catch((err) =>
            Swal.fire('Error', err.message || 'No se pudo crear la cama', 'error')
          );
      }
    });
  });

  $(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    try {
      const [cama, habitaciones] = await Promise.all([
        fetch(`/api/camas/${id}`).then((r) => r.json()),
        cargarHabitaciones()
      ]);

      // Agrupar por sector
      const habitacionesPorSector = {};
      habitaciones.forEach(h => {
        const sector = h.sector?.nombre || 'Sin sector';
        if (!habitacionesPorSector[sector]) habitacionesPorSector[sector] = [];
        habitacionesPorSector[sector].push(h);
      });

      // Buscar sector actual de la cama
      const habitacionActual = habitaciones.find(h => h.id_habitacion == cama.id_habitacion);
      const sectorActual = habitacionActual?.sector?.nombre || '';

      Swal.fire({
        title: 'Editar Cama',
        html: `
          <label class="form-label text-start d-block mb-1"><strong>Nombre:</strong></label>
          <input id="swal-nombre" class="form-control mb-2 text-center" value="${cama.nombre}" placeholder="Nombre (1 letra)">

          <label class="form-label text-start d-block mb-1"><strong>Sector:</strong></label>
          <select id="swal-sector" class="form-select mb-2">
            <option disabled value="">Seleccionar sector</option>
            ${Object.keys(habitacionesPorSector).map(sector => `
              <option value="${sector}" ${sector === sectorActual ? 'selected' : ''}>${sector}</option>
            `).join('')}
          </select>

          <label class="form-label text-start d-block mb-1"><strong>Habitación:</strong></label>
          <select id="swal-id_habitacion" class="form-select mb-2">
            <option value="">Seleccionar una habitación</option>
          </select>

          <label class="form-label text-start d-block mb-1"><strong>Desinfección ok:</strong></label>
          <select id="swal-desinfeccion" class="form-select mb-2">
            <option value="1" ${cama.desinfeccion ? 'selected' : ''}>Sí</option>
            <option value="0" ${!cama.desinfeccion ? 'selected' : ''}>No</option>
          </select>

          <label class="form-label text-start d-block mb-1"><strong>Estado:</strong></label>
          <select id="swal-estado" class="form-select">
            <option value="0" ${!cama.estado ? 'selected' : ''}>Disponible</option>
            <option value="1" ${cama.estado ? 'selected' : ''}>Ocupada</option>
          </select>
        `,
        customClass: { popup: 'swal2-card-style' },
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        didOpen: () => {
          const selectSector = document.getElementById('swal-sector');
          const selectHabitacion = document.getElementById('swal-id_habitacion');

          if (sectorActual) {
            const habs = habitacionesPorSector[sectorActual] || [];
            habs.forEach(h => {
              const option = document.createElement('option');
              option.value = h.id_habitacion;
              option.textContent = `Hab. ${h.num}`;
              if (h.id_habitacion == cama.id_habitacion) option.selected = true;
              selectHabitacion.appendChild(option);
            });
          }

          // Cambiar habitaciones al seleccionar otro sector
          selectSector.addEventListener('change', function () {
            const seleccionadas = habitacionesPorSector[this.value] || [];
            selectHabitacion.innerHTML = '<option value="">Seleccionar una habitación</option>';
            seleccionadas.forEach(h => {
              const option = document.createElement('option');
              option.value = h.id_habitacion;
              option.textContent = `Hab. ${h.num}`;
              selectHabitacion.appendChild(option);
            });
          });
        },
        preConfirm: () => {
          const nombre = document.getElementById('swal-nombre').value.trim().toUpperCase();
          const id_habitacion = document.getElementById('swal-id_habitacion').value;
          const desinfeccion = document.getElementById('swal-desinfeccion').value;
          const estado = document.getElementById('swal-estado').value;

          if (!/^[A-Z]$/.test(nombre)) {
            Swal.showValidationMessage('El nombre debe ser una sola letra (A–Z).');
            return false;
          }
          if (!id_habitacion) {
            Swal.showValidationMessage('Debes seleccionar una habitación.');
            return false;
          }

          return { nombre, id_habitacion, desinfeccion, estado };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`/api/camas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          })
            .then(async (response) => {
              if (response.status === 409) {
                const error = await response.json();
                throw new Error(error.message || 'Ya existe otra cama con ese nombre');
              }
              if (!response.ok) throw new Error('Error al actualizar la cama');
              return response.json();
            })
            .then(() =>
              Swal.fire('Actualizado', 'Cama modificada con éxito', 'success').then(() =>
                location.reload()
              )
            )
            .catch((err) => {
              Swal.fire('Error', err.message || 'No se pudo actualizar la cama', 'error');
            });
        }
      });
    } catch (err) {
      console.error('❌ Error al cargar cama:', err);
      Swal.fire('Error', 'No se pudo cargar los datos para editar', 'error');
    }
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar cama?',
      text: 'Esta acción eliminará la cama permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/camas/${id}`, { method: 'DELETE' })
          .then((res) => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(() =>
            Swal.fire('Eliminado', 'Cama eliminada', 'success').then(() =>
              location.reload()
            )
          )
          .catch(() => Swal.fire('Error', 'No se pudo eliminar la cama', 'error'));
      }
    });
  });

  async function cargarHabitaciones() {
    try {
      const response = await fetch('/api/habitaciones');
      if (!response.ok) throw new Error();
      return await response.json();
    } catch {
      return [];
    }
  }
});
