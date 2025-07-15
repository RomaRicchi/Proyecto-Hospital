$(document).ready(function () {
  const tabla = $('#tablaDiasSemana').DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
      destroy: true,
      responsive: true,
      scrollX: false,
  });

  fetch('/api/dias-semana')
    .then(res => res.json())
    .then(dias => {
      dias.forEach(d => {
        tabla.row.add([d.nombre]);
      });
      tabla.draw();
    });
});
