$(document).ready(function () {
  const $tabla = $('#tablaPacientesCamas');
  if (!$tabla.length) return;

  // Inicializar DataTable sin controles de fecha
  const dt = $tabla.DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
    },
    paging: true,
    pageLength: 10,
    searching: true,
    ordering: true,
    responsive: true,
    scrollX: false,
  });

  // Opcional: mensaje si no hay ocupaciones
  if (dt.data().count() === 0) {
    $('#tablaPacientesCamas_wrapper').prepend(`
      <div class="alert alert-warning mt-3">No hay camas ocupadas en este momento.</div>
    `);
  }
  
});
