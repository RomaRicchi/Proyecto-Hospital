import { validarTexto } from './utils/validacionesImput.js';

$(document).ready(function () {
  const $tabla = $('#tablaSalud');
  if (!$tabla.length) return;

  fetch('/api/personal-salud')
    .then(r => r.json())
    .then(personal => {
      const dataSet = personal.map(p => [
        p.apellido,
        p.nombre,
        p.rol?.nombre || '',
        p.especialidad?.nombre || '',
        p.matricula,
        p.activo ? 'Activo' : 'Inactivo', 
        `
        <button class="btn btn-sm btn-primary edit-btn" data-id="${p.id_personal_salud}">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${p.id_personal_salud}">
          <i class="fas fa-trash"></i>
        </button>
        `
      ]);

      const dt = $tabla.DataTable({
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
        paging: true,
        pageLength: 10,
        data: dataSet,
        destroy: true,
        responsive: true,
        scrollX: false,
        columns: [
          { title: 'Apellido' },
          { title: 'Nombre' },
          { title: 'Rol' },
          { title: 'Especialidad' },
          { title: 'Matrícula' },
          { title: 'Estado' }, 
          { title: 'Acciones', orderable: false, searchable: false }
        ]
      });
    });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/personal-salud/${id}`)
      .then(r => r.json())
      .then(p => {
        Swal.fire({
          title: 'Editar Profesional',
          html: `
            <input id="apellido" class="swal2-input" placeholder="Apellido" value="${p.apellido}">
            <input id="nombre" class="swal2-input" placeholder="Nombre" value="${p.nombre}">
            <input id="matricula" class="swal2-input" placeholder="Matrícula (opcional)" value="${p.matricula || ''}">
            <select id="estado" class="swal2-select">
              <option value="true" ${p.activo ? 'selected' : ''}>Activo</option>
              <option value="false" ${!p.activo ? 'selected' : ''}>Inactivo</option>
            </select>
          `,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          customClass: {
					  popup: 'swal2-card-style'
				  },
          preConfirm: () => {
            const apellido = $('#apellido').val();
            const nombre = $('#nombre').val();
            const matricula = $('#matricula').val();
            const activo = $('#estado').val() === 'true';

            let err = validarTexto(apellido, 'Apellido') || validarTexto(nombre, 'Nombre');
            if (err) {
              Swal.showValidationMessage(err);
              return false;
            }

            return {
              apellido: apellido.trim(),
              nombre: nombre.trim(),
              matricula: matricula.trim() || null,
              activo
            };
          }
        }).then(result => {
          if (!result.isConfirmed) return;

          fetch(`/api/personal-salud/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.value)
          })
            .then(res => {
              if (!res.ok) throw new Error();
              return res.json();
            })
            .then(() =>
              Swal.fire('Actualizado', 'Profesional modificado', 'success').then(() => location.reload())
            )
            .catch(() =>
              Swal.fire('Error', 'No se pudo actualizar el profesional', 'error')
            );
        });
      })
      .catch(() => {
        Swal.fire('Error', 'No se pudo cargar el profesional.', 'error');
      });
  });

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Dar de baja?',
      text: 'El profesional será marcado como inactivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      customClass: {
					popup: 'swal2-card-style'
				},
    }).then(result => {
      if (!result.isConfirmed) return;

      fetch(`/api/personal-salud/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.status === 409) throw new Error('No se puede dar de baja: en uso.');
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() =>
          Swal.fire('Baja exitosa', 'Profesional dado de baja', 'success').then(() => location.reload())
        )
        .catch(err =>
          Swal.fire('Error', err.message || 'No se pudo dar de baja', 'error')
        );
    });
  });
});
