document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('editado') === '1') {
    Swal.fire({
      icon: 'success',
      title: 'Perfil actualizado',
      text: 'Los datos fueron guardados correctamente.',
      customClass: { popup: 'swal2-card-style' }
    });
  }

  const btn = document.getElementById('btnCambiarPassword');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Cambiar contraseña',
      html: `
        <input id="swal-actual" type="password" class="swal2-input" placeholder="Contraseña actual">
        <input id="swal-nueva" type="password" class="swal2-input" placeholder="Nueva contraseña">
        <input id="swal-confirmar" type="password" class="swal2-input" placeholder="Confirmar nueva contraseña">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      customClass: {
        popup: 'swal2-card-style'
      },
      preConfirm: () => {
        const actual = document.getElementById('swal-actual').value;
        const nueva = document.getElementById('swal-nueva').value;
        const confirmar = document.getElementById('swal-confirmar').value;

        if (!actual || !nueva || !confirmar) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        if (nueva.length < 6) {
          Swal.showValidationMessage('La nueva contraseña debe tener al menos 6 caracteres');
          return false;
        }
        if (nueva !== confirmar) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return false;
        }

        return { actual, nueva, confirmar };
      }
    });

    if (!formValues) return;

    try {
      const response = await fetch('/api/usuarios/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      if (response.ok) {
        const data = await response.json();
        Swal.fire('¡Éxito!', data.message || 'Contraseña actualizada correctamente.', 'success');
      } else {
        const data = await response.json().catch(() => null);
        Swal.fire('Error', data?.message || 'No se pudo cambiar la contraseña.', 'error');
      }

    } catch (err) {
      Swal.fire('Error', 'Error de conexión o del servidor.', 'error');
    }
  });

  history.replaceState(null, '', window.location.pathname);
});
