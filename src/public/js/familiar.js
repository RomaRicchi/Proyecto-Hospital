$(document).ready(function () {
  const tabla = $('#tablaFamiliar');
  if (tabla.length) {
    const dataTable = tabla.DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,  
		  destroy: true,
      responsive: true,
		  scrollX: false,
		  columnDefs: [{ targets: [6], orderable: false, searchable: false }], 
    });

    dataTable.on('draw', function () {
      const info = dataTable.page.info();
      if (info.recordsDisplay === 0) {
        if ($('#btnAgregarFamiliar').length === 0) {
          $('#tablaFamiliar_wrapper').append(`
            <div class="text-center mt-3">
              <button id="btnAgregarFamiliar" class="btn btn-success">
                Agregar Nuevo Familiar
              </button>
            </div>
          `);
        }
      } else {
        $('#btnAgregarFamiliar').remove();
      }
    });
  }

  // 📌 Función para cargar parentescos desde la API
  async function cargarParentescos() {
    const response = await fetch('/api/parentescos');
    const parentescos = await response.json();
    return parentescos
      .map((p) => `<option value="${p.id_parentesco}">${p.nombre}</option>`)
      .join('');
  }

  // 📌 Función para buscar paciente por DNI
  async function buscarPacientePorDNI(dni) {
    const response = await fetch('/api/pacientes');
    const pacientes = await response.json();
    return pacientes.find((p) => p.dni_paciente == dni);
  }

  // 🟢 Agregar familiar
  $(document).on('click', '#btnAgregarFamiliar', async function () {
    const opcionesParentesco = await cargarParentescos();

    Swal.fire({
      title: 'Agregar Familiar',
      html: `
        <input id="swal-dni"        class="swal2-input" placeholder="DNI Paciente">
        <input id="swal-nombre"     class="swal2-input" placeholder="Nombre Familiar">
        <input id="swal-apellido"   class="swal2-input" placeholder="Apellido Familiar">
        <input id="swal-telefono"   class="swal2-input" placeholder="Teléfono Familiar">
        <select id="swal-parentesco" class="swal2-input">
          <option value="">-- Parentesco --</option>
          ${opcionesParentesco}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: async () => {
        const dniRaw       = document.getElementById('swal-dni').value.trim();
        const nombre       = document.getElementById('swal-nombre').value.trim();
        const apellido     = document.getElementById('swal-apellido').value.trim();
        const telefonoRaw  = document.getElementById('swal-telefono').value.trim();
        const id_parentesco = document.getElementById('swal-parentesco').value;

        // Validaciones
        if (!/^\d{7,}$/.test(dniRaw)) {
          Swal.showValidationMessage('DNI inválido (mínimo 7 dígitos numéricos).');
          return false;
        }
        const paciente = await buscarPacientePorDNI(dniRaw);
        if (!paciente) {
          Swal.showValidationMessage('No existe un paciente con ese DNI.');
          return false;
        }
        if (!nombre) {
          Swal.showValidationMessage('El nombre del familiar es obligatorio.');
          return false;
        }
        if (!apellido) {
          Swal.showValidationMessage('El apellido del familiar es obligatorio.');
          return false;
        }
        if (!/^\+?\d{6,15}$/.test(telefonoRaw)) {
          Swal.showValidationMessage('Teléfono inválido (solo dígitos, 6–15 caracteres).');
          return false;
        }
        if (!id_parentesco) {
          Swal.showValidationMessage('Selecciona un parentesco.');
          return false;
        }

        return {
          nombre,
          apellido,
          telefono: telefonoRaw,
          id_paciente: paciente.id_paciente,
          id_parentesco: parseInt(id_parentesco, 10),
          estado: true
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('/api/familiares', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(() =>
            Swal.fire('Guardado', 'Familiar creado', 'success').then(() => location.reload())
          )
          .catch(() =>
            Swal.fire('Error', 'No se pudo crear el familiar', 'error')
          );
      }
    });
  });

  // 🟠 Editar familiar
  $(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    const opcionesParentesco = await cargarParentescos();

    fetch(`/api/familiares/${id}`)
      .then((res) => res.json())
      .then(async (familiar) => {
        Swal.fire({
          title: 'Editar Familiar',
          html: `
            <input id="swal-dni"        class="swal2-input" value="${familiar.paciente?.dni_paciente || ''}" placeholder="DNI Paciente">
            <input id="swal-nombre"     class="swal2-input" value="${familiar.nombre}" placeholder="Nombre Familiar">
            <input id="swal-apellido"   class="swal2-input" value="${familiar.apellido}" placeholder="Apellido Familiar">
            <input id="swal-telefono"   class="swal2-input" value="${familiar.telefono}" placeholder="Teléfono Familiar">
            <select id="swal-parentesco" class="swal2-input">
              <option value="">-- Parentesco --</option>
              ${opcionesParentesco}
            </select>
          `,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          didOpen: () => {
            // Preseleccionar parentesco actual
            document.getElementById('swal-parentesco').value = familiar.id_parentesco;
          },
          preConfirm: async () => {
            const dniRaw       = document.getElementById('swal-dni').value.trim();
            const nombre       = document.getElementById('swal-nombre').value.trim();
            const apellido     = document.getElementById('swal-apellido').value.trim();
            const telefonoRaw  = document.getElementById('swal-telefono').value.trim();
            const id_parentesco = document.getElementById('swal-parentesco').value;

            // Validaciones (mismas que al crear)
            if (!/^\d{7,}$/.test(dniRaw)) {
              Swal.showValidationMessage('DNI inválido (mínimo 7 dígitos numéricos).');
              return false;
            }
            const paciente = await buscarPacientePorDNI(dniRaw);
            if (!paciente) {
              Swal.showValidationMessage('No existe un paciente con ese DNI.');
              return false;
            }
            if (!nombre) {
              Swal.showValidationMessage('El nombre del familiar es obligatorio.');
              return false;
            }
            if (!apellido) {
              Swal.showValidationMessage('El apellido del familiar es obligatorio.');
              return false;
            }
            if (!/^\+?\d{6,15}$/.test(telefonoRaw)) {
              Swal.showValidationMessage('Teléfono inválido (solo dígitos, 6–15 caracteres).');
              return false;
            }
            if (!id_parentesco) {
              Swal.showValidationMessage('Selecciona un parentesco.');
              return false;
            }

            return {
              nombre,
              apellido,
              telefono: telefonoRaw,
              id_paciente: paciente.id_paciente,
              id_parentesco: parseInt(id_parentesco, 10),
            };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/api/familiares/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(result.value),
            })
              .then(() =>
                Swal.fire('Actualizado', 'Familiar modificado', 'success').then(() => location.reload())
              )
              .catch(() =>
                Swal.fire('Error', 'No se pudo actualizar el familiar', 'error')
              );
          }
        });
      });
  });

  // 🔴 Eliminar familiar
  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar familiar?',
      text: 'Esta acción eliminará el familiar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/familiares/${id}`, { method: 'DELETE' })
          .then(() =>
            Swal.fire('Eliminado', 'Familiar eliminado', 'success').then(() => location.reload())
          )
          .catch(() =>
            Swal.fire('Error', 'No se pudo eliminar el familiar', 'error')
          );
      }
    });
  });
  // 🔄 Detectar si viene con idPaciente por URL y abrir Swal automáticamente
  const urlParams = new URLSearchParams(window.location.search);
  const idPaciente = urlParams.get('idPaciente');

  if (idPaciente) {
    abrirSwalAgregarFamiliarConPaciente(idPaciente);
  }

  // 🧩 Función para abrir el Swal precargado con un paciente por ID
  async function abrirSwalAgregarFamiliarConPaciente(idPaciente) {
    const [paciente, opcionesParentesco] = await Promise.all([
      fetch(`/api/pacientes/${idPaciente}`).then(r => r.json()),
      cargarParentescos()
    ]);

    if (!paciente || paciente.message) {
      Swal.fire('Error', 'Paciente no encontrado', 'error');
      return;
    }

    Swal.fire({
      title: 'Agregar Familiar',
      html: `
        <input id="swal-dni" class="swal2-input" value="${paciente.dni_paciente}" disabled placeholder="DNI Paciente">
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre Familiar">
        <input id="swal-apellido" class="swal2-input" placeholder="Apellido Familiar">
        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono Familiar">
        <select id="swal-parentesco" class="swal2-input">
          <option value="">-- Parentesco --</option>
          ${opcionesParentesco}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: async () => {
        const nombre = document.getElementById('swal-nombre').value.trim();
        const apellido = document.getElementById('swal-apellido').value.trim();
        const telefono = document.getElementById('swal-telefono').value.trim();
        const id_parentesco = document.getElementById('swal-parentesco').value;

        if (!nombre) return Swal.showValidationMessage('Nombre requerido');
        if (!apellido) return Swal.showValidationMessage('Apellido requerido');
        if (!/^\+?\d{6,15}$/.test(telefono))
          return Swal.showValidationMessage('Teléfono inválido');
        if (!id_parentesco)
          return Swal.showValidationMessage('Selecciona un parentesco');

        return {
          nombre,
          apellido,
          telefono,
          id_paciente: paciente.id_paciente,
          id_parentesco: parseInt(id_parentesco),
          estado: true
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('/api/familiares', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        })
          .then(() => Swal.fire('Guardado', 'Familiar creado', 'success').then(() => location.href = '/familiar'))
          .catch(() => Swal.fire('Error', 'No se pudo crear el familiar', 'error'));
      }
    });
  }

});
