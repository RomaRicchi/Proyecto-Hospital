$(document).ready(function () {
  const tabla = $('#tablaPacientes');

  if (!tabla.length) return;

  const dataTable = tabla.DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
    },
    paging: true,
    pageLength: 10,
    searching: true,
    ordering: true,
    destroy: true,
    responsive: true,
    scrollX: true,
    columnDefs: [
      { targets: -1, orderable: false, searchable: false }
    ]
  });

  tabla.on('click', 'tbody tr', function (e) {
    if ($(e.target).closest('a, button').length > 0) return;

    const dni = $(this).data('dni');
    if (dni) {
      window.location.href = `/registroClinico?dni=${dni}`;
    }
  });
});
