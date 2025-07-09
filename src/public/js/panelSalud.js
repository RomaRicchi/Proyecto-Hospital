$(document).ready(function () {
  $('#tablaPacientes').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
    },
    paging: true,
    searching: true,
    ordering: true,
    pageLength: 10,
    destroy: true
  });

  // Hacer que las filas sean clickeables y redirijan a registroClinico con el dni
  $('#tablaPacientes tbody').on('click', 'tr', function () {
    const dni = $(this).data('dni');
    if (dni) {
      window.location.href = `/registroClinico?dni=${dni}`;
    }
  });
});
