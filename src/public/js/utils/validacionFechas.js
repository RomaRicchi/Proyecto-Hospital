export function configurarBusquedaDeCamas(callbackBuscarCamas) { 
	const hoyLocal = new Date();
	const offset = hoyLocal.getTimezoneOffset();
	hoyLocal.setMinutes(hoyLocal.getMinutes() - offset);
	const hoyStr = hoyLocal.toISOString().split('T')[0];

	$('#fecha_busqueda').val(hoyStr);

	$('#formBuscarCamas').on('submit', function (e) {
		e.preventDefault();
		const fechaSeleccionadaStr = $('#fecha_busqueda').val();

		if (!fechaSeleccionadaStr) {
			Swal.fire('Atención', 'Debe seleccionar una fecha.', 'warning');
			return;
		}

		callbackBuscarCamas(fechaSeleccionadaStr);
	});
}

export function obtenerFechaBusquedaFormateada() {
	const input = document.querySelector('#fecha_busqueda');
	if (!input) return null;

	const fecha = input.value;
	if (!fecha) return null;

	const fechaStr = `${fecha}T00:00`;
	return fechaStr;
}

export function aplicarReservaSemanal(inputIngreso, inputEgreso, inputMotivoEgr) {
  if (!inputIngreso || !inputEgreso) return;

  const ingreso = new Date(inputIngreso.value);
  if (isNaN(ingreso)) return;

  const egreso = new Date(ingreso);
  egreso.setDate(egreso.getDate() + 5);         
  egreso.setHours(23, 59, 0, 0);                

  // Convertir a UTC ISO para backend
  const isoUTC = toUTC(egreso);
  inputEgreso.value = isoUTC;
  inputEgreso.disabled = true;
  inputEgreso.title = 'El egreso se fija automáticamente a 7 días en reservas.';

  if (inputMotivoEgr) {
    inputMotivoEgr.disabled = true;
    inputMotivoEgr.placeholder = '(No editable en reservas)';
    inputMotivoEgr.title = 'Deshabilitado hasta que se confirme la reserva.';
  }
}

export function parseFechaLocal(fechaStr) {
	if (!fechaStr) return null;
	if (!fechaStr.includes(':')) return null;

	// Si falta el componente de segundos, lo agregamos
	if (fechaStr.split(':').length === 2) {
		fechaStr += ':00';
	}

	// Validar la fecha de forma más explícita
	if (isNaN(Date.parse(fechaStr))) return null;

	const fecha = new Date(fechaStr);
	return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000); // convierte a UTC
}

export function toUTC(inputDate, formato = 'iso') {
  const date = new Date(inputDate);
  const iso = date.toISOString();
  if (formato === 'sql') return iso.slice(0, 19).replace("T", " "); // para MySQL crudo
  if (formato === 'compact') return iso.slice(0, 19) + 'Z'; // sin milisegundos
  return iso; // ISO completo con ms y Z
}

export function getFechaLocalParaInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function formatDate(isoString) {
  const fecha = new Date(isoString);
  const offset = fecha.getTimezoneOffset(); // minutos
  fecha.setMinutes(fecha.getMinutes() - offset); // Ajustamos a local (Argentina)

  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatHour(isoString) {
  const fecha = new Date(isoString);
  const offset = fecha.getTimezoneOffset(); // minutos
  fecha.setMinutes(fecha.getMinutes() - offset); // Ajustamos a local (Argentina)

  return fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function validarFechaNoPasada(fechaStr) {
  if (!fechaStr) return 'Debes seleccionar una fecha.';

  const fecha = new Date(fechaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);       // hoy a las 00:00
  fecha.setHours(0, 0, 0, 0);     // fecha ingresada a las 00:00

  if (fecha < hoy) return 'No se permite una fecha en el pasado.';
  return null;
}

export function validarFechaReservaRango(fechaStr) {
  if (!fechaStr) return 'Debes seleccionar una fecha.';

  const fecha = new Date(fechaStr);
  const hoy = new Date();

  // Mañana (sin horas)
  const mañana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  
  // Límite máximo (hoy + 1 año)
  const limite = new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate());

  if (fecha < mañana) {
    return 'La fecha debe ser a partir de mañana.';
  }

  if (fecha > limite) {
    return 'La fecha no puede ser mayor a 1 año desde hoy.';
  }

  return null;
}