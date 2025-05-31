$(document).ready(function () {
    const tabla = $('#tablaCamas');

    if (tabla.length) {
        const dt = tabla.DataTable({
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            paging: true,
            pageLength: 5,
            searching: true,
            ordering: true,
            columnDefs: [{ targets: [5], orderable: false, searchable: false }],
        });

        // Opcional: manejamos cuando no hay resultados filtrados
        dt.on('draw', function () {
            const noResults = dt.rows({ filter: 'applied' }).data().length === 0;
            $('#btnAgregarCama').remove();
            if (noResults) {
                $('#tablaCamas_wrapper').append(`
                    <div class="text-center mt-3">
                        <button id="btnAgregarCama" class="btn btn-success">
                            Agregar Nueva Cama
                        </button>
                    </div>
                `);
            }
        });
    }

    // 🔸 Agregar nueva cama
    $(document).on('click', '#btnAgregarCama', async function () {
        const habitaciones = await cargarHabitaciones();
        let opcionesHabitacion = '';
        habitaciones.forEach(hab => {
            opcionesHabitacion += `<option value="${hab.id_habitacion}">Habitación ${hab.num}</option>`;
        });

        Swal.fire({
            title: 'Agregar Nueva Cama',
            html: `
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre">
                <select id="swal-id_habitacion" class="swal2-input">${opcionesHabitacion}</select>
                <select id="swal-desinfeccion" class="swal2-input">
                    <option value="0">No</option>
                    <option value="1">Sí</option>
                </select>
                <select id="swal-estado" class="swal2-input">
                    <option value="0">Disponible</option>
                    <option value="1">Ocupada</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => ({
                nombre: $('#swal-nombre').val(),
                id_habitacion: $('#swal-id_habitacion').val(),
                desinfeccion: $('#swal-desinfeccion').val(),
                estado: $('#swal-estado').val(),
            }),
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/camas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value),
                })
                    .then((response) => {
                        if (!response.ok) throw new Error('Error al crear la cama');
                        return response.json();
                    })
                    .then(() =>
                        Swal.fire('Agregado', 'Cama creada con éxito', 'success').then(() =>
                            location.reload()
                        )
                    )
                    .catch(() => Swal.fire('Error', 'No se pudo crear la cama', 'error'));
            }
        });
    });

    // 🔸 Editar cama
    $(document).on('click', '.edit-btn', async function () {
        const id = $(this).data('id');
        const cama = await fetch(`/api/camas/${id}`).then((r) => r.json());
        const habitaciones = await cargarHabitaciones();
        let opcionesHabitacion = '';
        habitaciones.forEach(hab => {
            const selected = hab.id_habitacion == cama.id_habitacion ? 'selected' : '';
            opcionesHabitacion += `<option value="${hab.id_habitacion}" ${selected}>Habitación ${hab.num}</option>`;
        });

        Swal.fire({
            title: 'Editar Cama',
            html: `
                <input id="swal-nombre" class="swal2-input" value="${cama.nombre}" placeholder="Nombre">
                <select id="swal-id_habitacion" class="swal2-input">${opcionesHabitacion}</select>
                <select id="swal-desinfeccion" class="swal2-input">
                    <option value="0" ${cama.desinfeccion ? '' : 'selected'}>No</option>
                    <option value="1" ${cama.desinfeccion ? 'selected' : ''}>Sí</option>
                </select>
                <select id="swal-estado" class="swal2-input">
                    <option value="0" ${cama.estado ? '' : 'selected'}>Disponible</option>
                    <option value="1" ${cama.estado ? 'selected' : ''}>Ocupada</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => ({
                nombre: $('#swal-nombre').val(),
                id_habitacion: $('#swal-id_habitacion').val(),
                desinfeccion: $('#swal-desinfeccion').val(),
                estado: $('#swal-estado').val(),
            }),
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/camas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result.value),
                })
                    .then((response) => {
                        if (!response.ok) throw new Error('Error al actualizar la cama');
                        return response.json();
                    })
                    .then(() =>
                        Swal.fire('Actualizado', 'Cama modificada', 'success').then(() =>
                            location.reload()
                        )
                    )
                    .catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
            }
        });
    });

    // 🔸 Eliminar cama
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
                    .then((response) => {
                        if (!response.ok) throw new Error('Error al eliminar la cama');
                        Swal.fire('Eliminado', 'Cama eliminada', 'success').then(() =>
                            location.reload()
                        );
                    })
                    .catch(() => Swal.fire('Error', 'No se pudo eliminar', 'error'));
            }
        });
    });
});

// 🔸 Cargar habitaciones desde el backend
async function cargarHabitaciones() {
    try {
        const response = await fetch('/api/habitaciones');
        if (!response.ok) throw new Error('No se pudieron cargar habitaciones');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}
