import { validarTexto } from './utils/validacionesImput.js';

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

  async function cargarEstados() {
    try {
      const res = await fetch('/api/estadoTurno');
      const estados = await res.json();
      tabla.clear();
      estados.forEach(e => {
        tabla.row.add([
          e.nombre,
          `<button class="btn btn-sm btn-primary" onclick="editarEstado(${e.id_estado}, '${e.nombre}')">Editar</button>
           <button class="btn btn-sm btn-danger" onclick="eliminarEstado(${e.id_estado})">Eliminar</button>`
        ]);
      });
      tabla.draw();
    } catch (err) {
      console.error('Error al cargar estados:', err);
    }
  }

  tabla.on('draw', function () {
    $('#btnAgregarEstado').remove();
    $('#tablaEstadoTurno_wrapper').prepend(`
      <div id="btnAgregarEstado" class="text-end mb-3">
        <button class="btn btn-success" id="btnCrearEstado">
          <i class="fas fa-plus-circle me-1"></i> Agregar Estado
        </button>
      </div>
    `);
  });

  $(document).on('click', '#btnCrearEstado', mostrarFormularioCrear);

  cargarEstados();

  window.mostrarFormularioCrear = async () => {
    const { value: nombre } = await Swal.fire({
      title: 'Nuevo Estado',
      input: 'text',
      inputLabel: 'Nombre del Estado',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      customClass: { popup: 'swal2-card-style' },
      preConfirm: (valor) => {
        const err = validarTexto(valor, 'Nombre del estado');
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }
        return valor.trim();
      }
    });

    if (!nombre) return;

    try {
      await fetch('/api/estadoTurno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      await cargarEstados();
    } catch (err) {
      console.error('Error al crear estado:', err);
    }
  };

  window.editarEstado = async (id, nombreActual) => {
    const { value: nombre } = await Swal.fire({
      title: 'Editar Estado',
      input: 'text',
      inputValue: nombreActual,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      customClass: { popup: 'swal2-card-style' },
      preConfirm: (valor) => {
        const err = validarTexto(valor, 'Nombre del estado');
        if (err) {
          Swal.showValidationMessage(err);
          return false;
        }
        return valor.trim();
      }
    });

    if (!nombre) return;

    try {
      await fetch(`/api/estadoTurno/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      });
      await cargarEstados();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  window.eliminarEstado = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Confirmar eliminación',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      customClass: { popup: 'swal2-card-style' }
    });

    if (!isConfirmed) return;

    try {
      await fetch(`/api/estadoTurno/${id}`, { method: 'DELETE' });
      await cargarEstados();
    } catch (err) {
      console.error('Error al eliminar estado:', err);
    }
  };
});
