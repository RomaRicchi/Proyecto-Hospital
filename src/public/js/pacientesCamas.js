$(document).ready(function () {
  
  const hoyLocal = new Date();
  const offset = hoyLocal.getTimezoneOffset();
  hoyLocal.setMinutes(hoyLocal.getMinutes() - offset);
  const hoy = hoyLocal.toISOString().split('T')[0];

  const $tabla = $('#tablaPacientesCamas');
  if (!$tabla.length) return;

  // 1) Crear controles de fecha UNA sola vez
  const $container = $('<div class="row mb-3"></div>');
  $container.append(`
    <div class="col-md-4">
      <label class="form-label">Desde ingreso:</label>
      <input type="date" id="fechaDesde" class="form-control">
    </div>
    <div class="col-md-4">
      <label class="form-label">Hasta ingreso:</label>
      <input type="date" id="fechaHasta" class="form-control">
    </div>
  `);
  $tabla.before($container);

  // 2) Extensión de búsqueda para filtrar por Fecha Ingreso (columna índice 5)
  $.fn.dataTable.ext.search.push((settings, data) => {
    const desde = $('#fechaDesde').val();
    const hasta = $('#fechaHasta').val();
    const ingresoTxt = data[5];
    if (!ingresoTxt) return true;
    const ingreso = new Date(ingresoTxt);
    if (desde && ingreso < new Date(desde)) return false;
    if (hasta && ingreso > new Date(hasta)) return false;
    return true;
  });

  // 3) Inicializar DataTable sin scrollX y con responsive
  const dt = $tabla.DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    paging: true,
    pageLength: 10,
    searching: true,
    ordering: true,
    destroy: true,
    responsive: true,
    scrollX: false,
    
  });

  // 4) Refrescar el filtro al cambiar las fechas
  $('#fechaDesde, #fechaHasta').on('change', () => dt.draw());

  // 5) Ocultar cualquier overflow-x sobrante
  $('.dataTables_wrapper .table-responsive').css('overflow-x', 'hidden');
});
