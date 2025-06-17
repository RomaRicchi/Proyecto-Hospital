document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formEmergencia');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Capturamos valores crudos
    const fechaInput       = document.getElementById('fecha_hora_ingreso').value;
    const sexo             = document.getElementById('sexo').value;
    const identificadorRaw = document.getElementById('identificador').value.trim();

    // ——— Validaciones ———
    // Fecha ingreso: obligatoria y no en el futuro
    if (!fechaInput) {
      return Swal.fire('Atención', 'Debes indicar fecha y hora de ingreso.', 'warning');
    }
    const fechaIngreso = new Date(fechaInput);
    const ahora        = new Date();
    if (isNaN(fechaIngreso.getTime())) {
      return Swal.fire('Atención', 'Formato de fecha y hora inválido.', 'warning');
    }
    if (fechaIngreso > ahora) {
      return Swal.fire('Atención', 'La fecha de ingreso no puede ser en el futuro.', 'warning');
    }

    // Sexo: obligatorio y uno de los valores permitidos
    const opcionesSexo = ['1', '2', '5']; // 1=M,2=F,5=NB
    if (!sexo || !opcionesSexo.includes(sexo)) {
      return Swal.fire('Atención', 'Selecciona una opción de sexo válida.', 'warning');
    }

    // Identificador (DNI temporal): obligatorio, numérico y mayor a cero
    if (!identificadorRaw) {
      return Swal.fire('Atención', 'Debes ingresar un identificador (DNI temporal).', 'warning');
    }
    const identificador = parseInt(identificadorRaw, 10);
    if (isNaN(identificador) || identificador <= 0) {
      return Swal.fire('Atención', 'El identificador debe ser un número entero positivo.', 'warning');
    }

    // Si todo pasó, enviamos la petición
    try {
      const res = await fetch('/api/emergencias/emergencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha_hora_ingreso: fechaInput, sexo, identificador }),
      });

      const data = await res.json();

      if (res.status === 409 && data.error && data.error.includes('existe')) {
        return Swal.fire({
          icon: 'warning',
          title: 'Paciente ya existe',
          text: data.error,
        });
      }

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Ingreso exitoso',
          html: `
            <p><b>Paciente:</b> ${data.paciente.apellido}, ${data.paciente.nombre} (DNI: ${data.paciente.dni})</p>
            <p><b>Habitación:</b> ${data.num_habitacion} - <b>Cama:</b> ${data.cama}</p>
          `,
        }).then(() => form.reset());
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'No se pudo realizar el ingreso.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión o del servidor.',
      });
    }
  });
});
