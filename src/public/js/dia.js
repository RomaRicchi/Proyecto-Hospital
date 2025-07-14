$(document).ready(function () {
  const tabla = $('#tablaDiasSemana').DataTable({
    language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    responsive: true,
    ordering: false,
    searching: false,
    paging: false
  });

  fetch('/api/dias-semana')
    .then(res => res.json())
    .then(dias => {
      dias.forEach(d => {
        tabla.row.add([d.id_dia, d.nombre]);
      });
      tabla.draw();
    });
});
