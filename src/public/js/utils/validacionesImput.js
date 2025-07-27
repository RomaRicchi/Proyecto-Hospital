export function validarTexto(campo, nombreCampo, min = 2, max = 50) {
  if (!campo || !campo.trim()) return `El campo "${nombreCampo}" es obligatorio.`;
  const texto = campo.trim();
  if (texto.length < min || texto.length > max) return `El campo "${nombreCampo}" debe tener entre ${min} y ${max} caracteres.`;
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ \-]+$/.test(texto))
    return `El campo "${nombreCampo}" solo permite letras, espacios y guiones.`;
  return null;
}

export function validarEmail(email) {
  if (!email || !email.includes('@')) return 'Debes ingresar un email válido.';
  return null;
}

export function validarPassword(pass, min = 5) {
  if (!pass || pass.length < min) return `La contraseña debe tener al menos ${min} caracteres.`;
  return null;
}

export function validarSelect(valor, nombreCampo) {
  if (!valor || valor === '') return `Debe seleccionar una opción para "${nombreCampo}".`;
  return null;
}

export function validarDNI(dni) {
  if (!dni || typeof dni !== 'string') return 'El DNI es obligatorio.';
  const limpio = dni.trim();
  if (!/^\d{8}$/.test(limpio)) {
    return 'El DNI debe contener exactamente 8 dígitos numéricos.';
  }
  return null;
}

export function validarFechaNacimiento(fechaStr) {
  if (!fechaStr) return 'La fecha de nacimiento es obligatoria.';

  const fecha = new Date(fechaStr);
  const hoy = new Date();

  if (isNaN(fecha.getTime())) return 'La fecha ingresada no es válida.';

  const edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  const dia = hoy.getDate() - fecha.getDate();

  const edadFinal = mes < 0 || (mes === 0 && dia < 0) ? edad - 1 : edad;

  if (edadFinal < 0 || edadFinal > 120) {
    return 'La edad debe estar entre 0 y 120 años.';
  }

  return null;
}

export function validarTelefono(telefono) {
  if (!telefono || !telefono.trim()) return 'El teléfono es obligatorio.';

  const limpio = telefono.trim();

  // No permitir más de un guion
  const guiones = (limpio.match(/-/g) || []).length;
  if (guiones > 1) return 'Solo se permite un guion en el teléfono.';

  // Validar formato general
  if (!/^[0-9\-]+$/.test(limpio)) {
    return 'El teléfono solo puede contener números y un guion.';
  }

  // Quitar el guion para contar dígitos reales
  const soloNumeros = limpio.replace(/-/g, '');

  if (soloNumeros.length < 10) {
    return 'El teléfono debe tener al menos 10 dígitos.';
  }

  if (!/^[0-9]+$/.test(soloNumeros)) {
    return 'El teléfono contiene caracteres no válidos.';
  }

  return null;
}

export function validarNumeroPositivo(valor, campo = 'Número') {
  if (!valor) return `El campo "${campo}" es obligatorio.`;
  if (!/^[1-9]\d{0,3}$/.test(valor)) {
    return `El campo "${campo}" debe ser un número entero positivo (1 a 9999).`;
  }
  return null;
}

export function validarFechaSoloHoy(fechaStr) {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  fecha.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  if (fecha.getTime() !== hoy.getTime()) {
    return 'Solo se permite la fecha de hoy.';
  }
  return null;
}
