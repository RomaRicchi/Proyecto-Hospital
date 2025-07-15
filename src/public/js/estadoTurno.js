$(document).ready(function () {
  const tabla = $('#tablaEstadoTurno').DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
      destroy: true,
      responsive: true,
      scrollX: false,
  });

  function cargarEstados() {
    fetch('/api/estadoTurno')
      .then(res => res.json())
      .then(estados => {
        tabla.clear();
        estados.forEach(e => {
          tabla.row.add([
            e.nombre,
            `<button class="btn btn-sm btn-primary" onclick="editarEstado(${e.id_estado}, '${e.nombre}')">Editar</button>
             <button class="btn btn-sm btn-danger" onclick="eliminarEstado(${e.id_estado})">Eliminar</button>`
          ]);
        });
        tabla.draw();
      });
  }
  tabla.on('draw', function () {
      $('#btnAgregarEstado').remove();

      $('#tablaEstadoTurno_wrapper').prepend(`
        <div id="btnAgregarEstado" class="text-end mb-3">
          <button class="btn btn-success" onclick="mostrarFormularioCrear()">
            <i class="fas fa-plus-circle me-1"></i> Agregar Estado
          </button>
        </div>
      `);
    });
  cargarEstados();

  window.mostrarFormularioCrear = () => {
    Swal.fire({
      title: 'Nuevo Estado',
      input: 'text',
      inputLabel: 'Nombre del Estado',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      preConfirm: nombre => {
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
        }
        return nombre;
      }
    }).then(result => {
      if (result.isConfirmed) {
        fetch('/api/estadoTurno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: result.value })
        }).then(cargarEstados);
      }
    });
  }

  window.editarEstado = (id, nombre) => {
    Swal.fire({
      title: 'Editar Estado',
      input: 'text',
      inputValue: nombre,
      showCancelButton: true,
      confirmButtonText: 'Actualizar'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`/api/estadoTurno/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: result.value })
        }).then(cargarEstados);
      }
    });
  }

  window.eliminarEstado = (id) => {
    Swal.fire({
      title: 'Confirmar eliminación',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`/api/estadoTurno/${id}`, { method: 'DELETE' }).then(cargarEstados);
      }
    });
  }
})