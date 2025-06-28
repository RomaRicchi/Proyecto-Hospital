$(document).ready(function () {
  const $tabla = $('#tablaRegistrosContainer');
  const $info = $('#infoPaciente');

  $('#btnBuscar').click(() => {
    const dni = $('#dniBuscar').val().trim();
    if (!dni) {
      Swal.fire('Ingrese un DNI válido');
      return;
    }

    fetch(`/api/registro-clinico/dni/${dni}`)
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(data => {
        if (!data || data.registros.length === 0) {
          $tabla.html('<div class="alert alert-warning">No se encontraron registros clínicos</div>');
        }
        mostrarInfoPaciente(data.paciente);
        mostrarTabla(data.registros);
      })
      .catch(() => {
        $tabla.html('<div class="alert alert-danger">Error al buscar registros</div>');
        $info.html('');
      });
  });

  function mostrarInfoPaciente(p) {
    if (!p) {
      $info.html('');
      return;
    }

    const edad = calcularEdad(p.fecha_nac);
    $info.html(`
      <div class="alert alert-info">
        <strong>Paciente:</strong> ${p.apellido_p}, ${p.nombre_p} &nbsp; | &nbsp;
        <strong>Edad:</strong> ${edad} años
      </div>
    `);
  }

  function mostrarTabla(arr) {
    let html = `
      <table id="tablaRegistros" class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Detalle</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
    `;

    arr.forEach(r => {
      html += `
        <tr>
          <td>${new Date(r.fecha).toLocaleString('es-AR')}</td>
          <td>${r.tipo}</td>
          <td>${r.detalle}</td>
          <td>${r.usuario}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    $tabla.html(html);

    $('#tablaRegistros').DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }, 
        paging: true,
        pageLength: 10,
     	searching: true,
      	ordering: true,  
		destroy: true,
      	responsive: true,
		scrollX: false,
    });
  }

  function calcularEdad(fechaNac) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
});
