$(document).ready(function () {
  $('#tablaCamas').DataTable({
    language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
    pageLength: 8
  });

  $(document).on('click', '.reserve-btn', async function () {
    const id_cama = $(this).data('id');

    // 🔍 Paso 1: Buscar paciente
    let pacienteSeleccionado = null;
    await Swal.fire({
      title: 'Buscar Paciente por DNI',
      input: 'number',
      inputLabel: 'Ingrese el DNI del paciente',
      inputPlaceholder: 'Ej: 12345678',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      preConfirm: async (dni) => {
        if (!dni) return Swal.showValidationMessage('Debe ingresar un DNI');
        const res = await fetch(`/api/pacientes?dni=${dni}`);
        const lista = await res.json();
        const p = lista.find(p => p.dni_paciente == dni);
        if (!p) {
          Swal.fire({
            title: 'Paciente no encontrado',
            text: '¿Desea registrarlo?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Registrar',
          }).then(r => {
            if (r.isConfirmed) window.location.href = '/paciente';
          });
          return false;
        }
        pacienteSeleccionado = p;
        return true;
      }
    });

    if (!pacienteSeleccionado) return;

    // Paso 2: Cargar cama completa (con habitación)
    const cama = await fetch(`/api/camas/${id_cama}`).then(r => r.json());
    const id_habitacion = cama.id_habitacion;

    // Paso 3: Verificar conflicto de género
    const checkGenero = await fetch('/api/movimientos_habitacion/verificar-genero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_habitacion,
        id_cama,
        id_genero: pacienteSeleccionado.id_genero
      })
    });
    const genResult = await checkGenero.json();
    if (!checkGenero.ok) {
      return Swal.fire('Conflicto de género', genResult.message || '', 'error');
    }

    // Paso 4: Cargar datos externos
    const [motivos, obras, medicos] = await Promise.all([
      fetch('/api/motivos_ingreso').then(r => r.json()),
      fetch('/api/obras-sociales').then(r => r.json()),
      fetch('/api/personal-salud').then(r => r.json())
    ]);

    const nowISOString = new Date().toISOString().slice(0, 16);

    const opcionesMotivos = motivos.map(m => `<option value="${m.id_motivo}">${m.tipo}</option>`).join('');
    const opcionesObras = obras.map(o => `<option value="${o.id_obra_social}">${o.nombre}</option>`).join('');
    const opcionesMedicos = medicos.map(m => `<option value="${m.id_personal_salud}">${m.apellido}, ${m.nombre}</option>`).join('');

    // Paso 5: Formulario de reserva
    const result = await Swal.fire({
      title: 'Reservar Cama',
      html: `
        <select id="id_obra_social" class="swal2-input"><option value="">-- Obra Social --</option>${opcionesObras}</select>
        <input type="text" id="num_asociado" class="swal2-input" placeholder="N° Asociado">
        <select id="id_motivo" class="swal2-input"><option value="">-- Motivo --</option>${opcionesMotivos}</select>
        <input type="datetime-local" id="fecha_ingreso" class="swal2-input" value="${nowISOString}" min="${nowISOString}">
        <input type="datetime-local" id="fecha_egreso" class="swal2-input" placeholder="Fecha de Egreso (opcional)">
        <input type="text" id="descripcion" class="swal2-input" placeholder="Descripción">
        <select id="id_medico" class="swal2-input"><option value="">-- Profesional --</option>${opcionesMedicos}</select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Reserva',
      preConfirm: () => {
        const id_obra_social = $('#id_obra_social').val();
        const num_asociado = $('#num_asociado').val().trim();
        const id_motivo = $('#id_motivo').val();
        const fecha_hora_ingreso = $('#fecha_ingreso').val();
        const fecha_hora_egreso = $('#fecha_egreso').val();
        const descripcion = $('#descripcion').val().trim();
        const id_personal_salud = $('#id_medico').val();

        if (!id_obra_social || !num_asociado || !id_motivo || !fecha_hora_ingreso) {
          Swal.showValidationMessage('Complete todos los campos obligatorios.');
          return false;
        }
        return {
          id_paciente: pacienteSeleccionado.id_paciente,
          id_obra_social,
          num_asociado,
          id_motivo,
          fecha_hora_ingreso,
          fecha_hora_egreso,
          descripcion,
          id_personal_salud
        };
      }
    });

    if (!result.isConfirmed) return;

    // Paso 6: Validar solapamiento (misma cama y fecha)
    const verif = await fetch('/api/movimientos_habitacion/validar-solapamiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_cama,
        fecha_hora_ingreso: result.value.fecha_hora_ingreso,
        fecha_hora_egreso: result.value.fecha_hora_egreso
      })
    });
    const verifData = await verif.json();
    if (!verif.ok) {
      return Swal.fire('Reserva inválida', verifData.message || 'Ya hay una reserva en esa cama en esa fecha.', 'error');
    }

    // Paso 7: Crear admisión
    const admRes = await fetch('/api/admisiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.value)
    });
    const admData = await admRes.json();

    // Paso 8: Crear movimiento tipo RESERVA
    const movRes = await fetch('/api/movimientos_habitacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_admision: admData.id_admision,
        id_habitacion,
        id_cama,
        fecha_hora_ingreso: result.value.fecha_hora_ingreso,
        fecha_hora_egreso: result.value.fecha_hora_egreso || null,
        id_mov: 3, // RESERVA
        estado: 1
      })
    });

    if (!movRes.ok) {
      return Swal.fire('Error', 'No se pudo guardar el movimiento de reserva.', 'error');
    }

    Swal.fire('Éxito', 'Reserva realizada correctamente.', 'success')
      .then(() => location.reload());
  });
});
