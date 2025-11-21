$(document).ready(function () {
  const tabla = $('#tablaPacientes').DataTable({
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
    },
    paging: true,
    searching: true,
    ordering: true,
    responsive: true,
    scrollX: true,
    columns: [
      { title: 'DNI' },
      { title: 'Nombre completo' },
      { title: 'Cama' },
      { title: 'Fecha de ingreso' },
      { title: 'Motivo ingreso' },
      { title: 'Acciones' }
    ]
  });

  async function cargarPacientesAsignados() {
    try {
      const res = await fetch('/api/personal-salud/asignados', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Error al cargar pacientes');

      const movimientos = await res.json();
      tabla.clear();

      movimientos.forEach(m => {
        const fecha = new Date(m.fecha_ingreso).toLocaleString('es-AR');

        tabla.row.add([
          m.dni,
          m.nombre,
          m.cama,
          fecha,
          m.motivo,
          `<button class="btn btn-sm btn-primary btn-ver-registro" data-dni="${m.dni}">
            <i class="fas fa-notes-medical me-1"></i> Registro
          </button>`
        ]);
      });

      tabla.draw();
    } catch (error) {
      console.error('❌ Error al cargar pacientes:', error);
      Swal.fire('Error', 'No se pudieron cargar los pacientes asignados', 'error');
    }
  }

  cargarPacientesAsignados();
  $(document).on('click', '.btn-ver-registro', function () {
    const dni = $(this).data('dni');
    if (dni) {
      localStorage.setItem('dniParaBuscar', dni);
      window.location.href = '/registroClinico';
    }
  });
  
  const idMedico = $('#usuarioData').data('id_personal_salud');

  if (idMedico) {
    $('a[href="/turnos"]').on('click', function (e) {
      e.preventDefault();
      window.location.href = `/turnos?medico=${idMedico}`;
    });

    $('a[href="/calendario"]').on('click', function (e) {
      e.preventDefault();
      window.location.href = `/calendario?medico=${idMedico}`;
    });
  }
});
