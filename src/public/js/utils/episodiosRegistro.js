import { formatDate, formatHour } from './validacionFechas.js';

export function agruparPorEpisodios(registros) {
  const grupos = [];
  let episodio = [];

  const ordenados = [...registros].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  ordenados.forEach(r => {
    if (r.id_tipo === 30) {
      if (episodio.length) grupos.push(episodio);
      episodio = [r];
    } else {
      episodio.push(r);
      if (r.id_tipo === 31) {
        grupos.push(episodio);
        episodio = [];
      }
    }
  });

  if (episodio.length > 0) grupos.push(episodio);
  return grupos;
}

export function mostrarEpisodios(grupos) {
  let html = '';

  const gruposOrdenados = [...grupos].reverse();

  gruposOrdenados.forEach((episodio, index) => {
    const ingreso = episodio.find(r => r.id_tipo === 30);
    const egreso = episodio.find(r => r.id_tipo === 31);

    const fechaIngreso = ingreso ? new Date(ingreso.fecha) : null;
    const fechaEgreso = egreso ? new Date(egreso.fecha) : null;

    let estado = 'Ambulatorio';

    if (ingreso) {
      if (!fechaEgreso || fechaEgreso > new Date()) {
        estado = 'Vigente';
      } else {
        estado = 'Finalizada';
      }
    }

    const textoFecha = ingreso
      ? `Ingreso: ${fechaIngreso.toLocaleDateString('es-AR')}`
      : 'Episodio ambulatorio';

    const colorEstado = {
      'Vigente': 'success',
      'Finalizada': 'secondary',
      'Ambulatorio': 'info'
    }[estado] || 'dark';

    html += `
      <div class="card mb-4 shadow">
        <div class="card-header bg-${colorEstado} text-white">
          Episodio ${index + 1} – ${textoFecha} – <strong>Estado:</strong> ${estado}
        </div>
        <div class="card-body table-responsive">
          <table class="table table-sm table-bordered table-striped">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
    `;

    [...episodio].reverse().forEach((r, i) => {
      const fechaStr = !isNaN(new Date(r.fecha))
        ? `${formatDate(r.fecha)} ${formatHour(r.fecha)}`
        : '—';

      html += `
        <tr>
          <td>${fechaStr}</td>
          <td>${r.tipo}</td>
          <td>${r.detalle}</td>
          <td>${r.usuario}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-editar-registro"
                    data-id="${r.id}"
                    data-index="${i}"
                    data-tipo="${r.id_tipo}"
                    data-fecha="${r.fecha}"
                    data-detalle="${r.detalle}">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>`;
    });

    html += '</tbody></table></div></div>';
  });

  $('#tablaRegistrosContainer').html(html);
}

