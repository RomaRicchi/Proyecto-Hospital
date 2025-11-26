document.addEventListener('DOMContentLoaded', () => {
 
  const btn = document.getElementById('btnRecuperarPassword');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      Swal.fire({
        title: 'Recuperar contraseña',
        input: 'email',
        inputLabel: 'Correo electrónico',
        inputPlaceholder: 'tuemail@ejemplo.com',
        confirmButtonText: 'Enviar',
        showCancelButton: true,
        customClass: {
          popup: 'swal2-card-style'
        },
        preConfirm: (email) => {
          if (!email || !email.includes('@')) {
            Swal.showValidationMessage('Debes ingresar un email válido');
            return false;
          }

          return fetch('/api/recuperacion/recuperar-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })
            .then(res => {
              if (!res.ok) throw new Error('No se pudo enviar el correo');
              return res.json();
            })
            .catch(() => {
              Swal.showValidationMessage('Error al enviar el correo de recuperación');
            });
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Listo', 'Se ha enviado un correo si existe una cuenta asociada.', 'success');
        }
      });
    });
  }

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
