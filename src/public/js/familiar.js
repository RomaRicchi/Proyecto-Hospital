import { 
	validarTexto,
  validarDNI, 
	validarTelefono 
} from './utils/validacionesImput.js';

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

  async function cargarParentescos() {
    const response = await fetch('/api/parentescos');
    const parentescos = await response.json();
    return parentescos
      .map((p) => `<option value="${p.id_parentesco}">${p.nombre}</option>`)
      .join('');
  }

  async function buscarPacientePorDNI(dni) {
    const response = await fetch('/api/pacientes');
    const pacientes = await response.json();
    return pacientes.find((p) => p.dni_paciente == dni);
  }

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
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: async () => {
        const dniRaw       = document.getElementById('swal-dni').value.trim();
        const nombre       = document.getElementById('swal-nombre').value.trim();
        const apellido     = document.getElementById('swal-apellido').value.trim();
        const telefonoRaw  = document.getElementById('swal-telefono').value.trim();
        const id_parentesco = document.getElementById('swal-parentesco').value;
        const errorDNI = validarDNI(dniRaw);
        if (errorDNI) {
          Swal.showValidationMessage(errorDNI);
          return false;
        }
        const paciente = await buscarPacientePorDNI(dniRaw);
        if (!paciente) {
          Swal.showValidationMessage('No existe un paciente con ese DNI.');
          return false;
        }
        if (!nombre||!apellido ) {
          Swal.showValidationMessage('El nombre completo del familiar es obligatorio.');
          return false;
        }
        const errNombre = validarTexto(nombre, 'Nombre');
        const errApellido = validarTexto(apellido, 'Apellido');
        const errTelefono = validarTelefono(telefonoRaw);
        if (errNombre || errApellido || errTelefono) {
          Swal.showValidationMessage(errNombre || errApellido || errTelefono);
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
          customClass: {
            popup: 'swal2-card-style'
          },
          didOpen: () => {
            document.getElementById('swal-parentesco').value = familiar.id_parentesco;
          },
          preConfirm: async () => {
            const dniRaw       = document.getElementById('swal-dni')?.value?.trim();
            const nombre       = document.getElementById('swal-nombre').value.trim();
            const apellido     = document.getElementById('swal-apellido').value.trim();
            const telefonoRaw  = document.getElementById('swal-telefono').value.trim();
            const id_parentesco = document.getElementById('swal-parentesco').value;

            const errorDNI = validarDNI(dniRaw);
            if (errorDNI) {
              Swal.showValidationMessage(errorDNI);
              return false;
            }
            const paciente = await buscarPacientePorDNI(dniRaw);
            if (!paciente) {
              Swal.showValidationMessage('No existe un paciente con ese DNI.');
              return false;
            }
            const errNombre = validarTexto(nombre, 'Nombre');
            const errApellido = validarTexto(apellido, 'Apellido');
            const errTelefono = validarTelefono(telefonoRaw);
            if (errNombre || errApellido || errTelefono) {
              Swal.showValidationMessage(errNombre || errApellido || errTelefono);
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

  $(document).on('click', '.delete-btn', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Eliminar familiar?',
      text: 'Esta acción eliminará el familiar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      },
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
  const urlParams = new URLSearchParams(window.location.search);
  const idPaciente = urlParams.get('idPaciente');

  if (idPaciente) {
    abrirSwalAgregarFamiliarConPaciente(idPaciente);
  }

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
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value.trim();
        const apellido = document.getElementById('swal-apellido').value.trim();
        const telefono = document.getElementById('swal-telefono').value.trim();
        const id_parentesco = document.getElementById('swal-parentesco').value;

        const errorNombre = validarTexto(nombre, 'Nombre');
        const errorApellido = validarTexto(apellido, 'Apellido');
        const errorTelefono = validarTelefono(telefono);

        if (errorNombre) return Swal.showValidationMessage(errorNombre);
        if (errorApellido) return Swal.showValidationMessage(errorApellido);
        if (errorTelefono) return Swal.showValidationMessage(errorTelefono);
        if (!id_parentesco) return Swal.showValidationMessage('Selecciona un parentesco.');

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
          .then(() => Swal.fire('Guardado', 'Familiar creado', 'success')
            .then(() => location.href = '/familiar'))
          .catch(() => Swal.fire('Error', 'No se pudo crear el familiar', 'error'));
      }
    });
  }

});
