document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('formEmergencia');
	if (!form) return;

	form.addEventListener('submit', async function (e) {
		e.preventDefault();

		const fecha_hora_ingreso =
			document.getElementById('fecha_hora_ingreso').value;
		const sexo = document.getElementById('sexo').value;
		const identificador = document.getElementById('identificador').value;

		try {
			const res = await fetch('/api/emergencias/emergencia', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fecha_hora_ingreso, sexo, identificador }),
			});

			const data = await res.json();

			if (res.ok) {
				Swal.fire({
					icon: 'success',
					title: 'Ingreso exitoso',
					html: `
                        <p><b>Paciente:</b> ${data.paciente.apellido}, ${data.paciente.nombre} (DNI: ${data.paciente.dni})</p>
                        <p><b>Habitación:</b> ${data.habitacion} - <b>Cama:</b> ${data.cama}</p>
                    `,
				}).then(() => {
					form.reset();
				});
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
