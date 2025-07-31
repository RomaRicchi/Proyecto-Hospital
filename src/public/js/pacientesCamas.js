document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/camas/ocupadas');
    if (!response.ok) throw new Error('No se pudo obtener la lista de camas');

    const camas = await response.json();
    console.log('Camas recibidas:', camas);

    const tbody = document.querySelector('#tablaPacientesCamas tbody');
    tbody.innerHTML = '';

    camas.forEach(cama => {
      const mov = Array.isArray(cama.movimientos) ? cama.movimientos[0] : null;
      if (!mov || !mov.admision || !mov.admision.paciente) return;

      const paciente = mov.admision.paciente;
      const sector = cama.habitacion?.sector?.nombre || '-';
      const habitacion = cama.habitacion?.num || '-';
      const camaNombre = cama.nombre || '-';

      const nombre = paciente.nombre_p || '-';
      const apellido = paciente.apellido_p || '-';
      const dni = paciente.dni_paciente || '-';
      const genero = paciente.genero?.nombre || '-';
      const camaAsignada = `${sector} - ${habitacion} - ${camaNombre}`;

      const fechaIngreso = mov.fecha_hora_ingreso
        ? new Date(mov.fecha_hora_ingreso).toLocaleString('es-AR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : '-';

      const fechaEgreso = mov.fecha_hora_egreso
        ? new Date(mov.fecha_hora_egreso).toLocaleString('es-AR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : '-';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nombre}</td>
        <td>${apellido}</td>
        <td>${dni}</td>
        <td>${genero}</td>
        <td>${camaAsignada}</td>
        <td>${fechaIngreso}</td>
        <td>${fechaEgreso}</td>
      `;
      tbody.appendChild(tr);
    });

    $('#tablaPacientesCamas').DataTable({
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
  }
});
