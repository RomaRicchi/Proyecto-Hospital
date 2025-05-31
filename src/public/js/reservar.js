$(document).on('click', '.reserve-btn', function () {
  const id = $(this).data('id');
  Swal.fire({
    title: '¿Reservar esta cama?',
    text: 'La cama se reservará temporalmente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, reservar',
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/api/movimientosHabitacion/reservar/${id}`, { method: 'POST' })
        .then(response => {
          if (!response.ok) throw new Error('Error al reservar');
          return response.text();
        })
        .then(() => Swal.fire('Reservada', 'La cama ha sido reservada', 'success').then(() => location.reload()))
        .catch(() => Swal.fire('Error', 'No se pudo reservar la cama', 'error'));
    }
  });
});
