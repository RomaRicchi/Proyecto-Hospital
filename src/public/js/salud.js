$(document).ready(function () {
  const $tabla = $('#tablaSalud');
  if (!$tabla.length) return;

  // Validaciones básicas
  function validarNombreCampo(texto, campo, min = 2, max = 50) {
    if (!texto || !texto.trim()) return `El campo "${campo}" es obligatorio.`;
    const val = texto.trim();
    if (val.length < min || val.length > max) return `El campo "${campo}" debe tener entre ${min} y ${max} caracteres.`;
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ \-]+$/.test(val)) return `El campo "${campo}" solo puede contener letras, espacios y guiones.`;
    return null;
  }

  // 1) Cargar tabla
  fetch('/api/personal-salud')
    .then(r => r.json())
    .then(personal => {
      const dataSet = personal.map(p => [
        p.apellido,
        p.nombre,
        p.rol?.nombre || '',
        p.especialidad?.nombre || '',
        p.matricula,
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
          { title: 'Acciones', orderable: false, searchable: false }
        ]
      });

      dt.on('draw', () => {
        $('#btnAgregarPersonal').remove();
        if (dt.rows({ filter: 'applied' }).data().length === 0) {
          $('#tablaSalud_wrapper').append(`
            <div id="btnAgregarPersonal" class="text-center mt-3">
              <button class="btn btn-success">
                <i class="fas fa-plus-circle me-1"></i> Agregar Profesional
              </button>
            </div>
          `);
        }
      });
      dt.draw();
    })
    .catch(() => {
      Swal.fire('Error', 'No se pudo cargar el personal.', 'error');
    });

  // 2) Alta
  $(document).on('click', '#btnAgregarPersonal button', () => {
    Swal.fire({
      title: 'Agregar Profesional',
      html: `
        <input id="apellido" class="swal2-input" placeholder="Apellido">
        <input id="nombre" class="swal2-input" placeholder="Nombre">
        <input id="matricula" class="swal2-input" placeholder="Matrícula (opcional)">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const apellido = $('#apellido').val();
        const nombre = $('#nombre').val();
        const matricula = $('#matricula').val();

        let err = validarNombreCampo(apellido, 'Apellido') || validarNombreCampo(nombre, 'Nombre');
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }

        return {
          apellido: apellido.trim(),
          nombre: nombre.trim(),
          matricula: matricula.trim() || null
        };
      }
    }).then(result => {
      if (!result.isConfirmed) return;

      fetch('/api/personal-salud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value)
      })
        .then(res => {
          if (res.status === 409) throw new Error('Ya existe un profesional con ese nombre.');
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(() =>
          Swal.fire('Guardado', 'Profesional registrado', 'success').then(() => location.reload())
        )
        .catch(err =>
          Swal.fire('Error', err.message || 'No se pudo crear el profesional', 'error')
        );
    });
  });

  // 3) Editar
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
          `,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          preConfirm: () => {
            const apellido = $('#apellido').val();
            const nombre = $('#nombre').val();
            const matricula = $('#matricula').val();

            let err = validarNombreCampo(apellido, 'Apellido') || validarNombreCampo(nombre, 'Nombre');
            if (err) {
              Swal.showValidationMessage(err);
              return false;
            }

            return {
              apellido: apellido.trim(),
              nombre: nombre.trim(),
              matricula: matricula.trim() || null
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

  // 4) Baja
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Dar de baja?',
      text: 'El profesional será marcado como inactivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
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
