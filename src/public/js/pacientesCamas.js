$(document).ready(function () {
  const $tabla = $('#tablaPacientesCamas');
  if (!$tabla.length) return;

  // 🔍 Filtros personalizados por fecha
  const contenedor = $('<div class="row mb-3"></div>');
  const filtroDesde = $(`
    <div class="col-md-4">
      <label class="form-label">Desde:</label>
      <input type="date" id="fechaDesde" class="form-control">
    </div>
  `);
  const filtroHasta = $(`
    <div class="col-md-4">
      <label class="form-label">Hasta:</label>
      <input type="date" id="fechaHasta" class="form-control">
    </div>
  `);

  $tabla.before(contenedor.append(filtroDesde, filtroHasta));

  // 🔍 Extensión de búsqueda personalizada para filtrar por fecha
  $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    const desde = $('#fechaDesde').val();
    const hasta = $('#fechaHasta').val();
    const fechaTexto = data[5]; // 📅 columna de fecha ingreso (6ta columna, índice 5)
    if (!fechaTexto) return true;

    const fecha = new Date(fechaTexto);
    if (desde && fecha < new Date(desde)) return false;
    if (hasta && fecha > new Date(hasta)) return false;
    return true;
  });

  // 🧾 Inicializar DataTable
  const dt = $tabla.DataTable({
    language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    pageLength: 10,
    ordering: true,
    searching: true,
  });

  // 🔄 Refiltrar al cambiar fechas
  $('#fechaDesde, #fechaHasta').on('change', function () {
    dt.draw();
  });
});
