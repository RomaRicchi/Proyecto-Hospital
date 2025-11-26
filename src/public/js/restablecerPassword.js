document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRestablecerPassword');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nueva = document.getElementById('inputNueva').value;
      const confirmar = document.getElementById('inputConfirmar').value;
      const token = form.dataset.token;

      if (!nueva || !confirmar) {
        mostrarError('Todos los campos son obligatorios');
        return;
      }

      if (nueva !== confirmar) {
        mostrarError('Las contraseñas no coinciden');
        return;
      }

      try {
        const res = await fetch(`/api/recuperacion/restablecer-password/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nueva, confirmar })
        });

        if (res.redirected) {
          window.location.href = res.url;
        } else {
          const html = await res.text();
          document.open();
          document.write(html);
          document.close();
        }
      } catch (err) {
        mostrarError('Error al procesar la solicitud');
      }
    });
  }

  function mostrarError(msg) {
    const errorDiv = document.getElementById('errorMensaje');
    if (errorDiv) {
      errorDiv.textContent = msg;
      errorDiv.classList.remove('d-none');
    }
  }
});

function togglePassword(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;

  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  btn.innerHTML = visible ? '🔓' : '🔒';
}
