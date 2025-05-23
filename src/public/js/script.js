document.addEventListener('DOMContentLoaded', () => { 
  // ⏰ Reloj en navbar
  function actualizarReloj() {
    const reloj = document.getElementById("reloj");
    if (reloj) {
      const ahora = new Date();
      const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const diaSemana = dias[ahora.getDay()];
      const dia = ahora.getDate();
      const mes = meses[ahora.getMonth()];
      const año = ahora.getFullYear();
      const horas = ahora.getHours().toString().padStart(2, '0');
      const minutos = ahora.getMinutes().toString().padStart(2, '0');

      const fechaHoraFormateada = `${diaSemana} ${dia} de ${mes} del año ${año} - ${horas}:${minutos}`;
      reloj.textContent = fechaHoraFormateada;
    }
  }
  setInterval(actualizarReloj, 1000);
  actualizarReloj();

  // 📦 Movimiento en tarjetas de médicos
  const cards = document.querySelectorAll('.expandible');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      cards.forEach(c => c.classList.remove('expandida'));
      card.classList.add('expandida');
    });
  });
  document.addEventListener('click', () => {
    cards.forEach(c => c.classList.remove('expandida'));
  });

  document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
  
    if (path.startsWith('/dashboard')) {
      document.getElementById('link-dashboard')?.classList.add('active');
    } else if (path.startsWith('/pacientes')) {
      document.getElementById('link-pacientes')?.classList.add('active');
    } else if (path.startsWith('/internaciones')) {
      document.getElementById('link-internaciones')?.classList.add('active');
    } else if (path.startsWith('/admisiones')) {
      document.getElementById('link-admisiones')?.classList.add('active');
    }
  });

  // 🔍 Filtro por DNI en formulario de pacientes
  const dniInput = document.getElementById('dni');
  if (dniInput) {
    dniInput.addEventListener('blur', () => {
      const dni = dniInput.value;
      fetch(`/api/paciente-por-dni?dni=${dni}`)
        .then(res => res.json())
        .then(data => {
          if (data.encontrado) {
            document.getElementById('nombre').value = data.nombre_p;
            document.getElementById('apellido').value = data.apellido_p;
            document.getElementById('cobertura').value = data.cobertura;
          }
        });
    });
  }

  // ✅ Confirmación antes de dar alta médica
  const altaForms = document.querySelectorAll('form[action*="/internaciones/alta/"]');
  altaForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!confirm('¿Estás seguro de dar el alta médica a este paciente?')) {
        e.preventDefault();
      }
    });
  });

  // 📜 Función para mostrar el formulario de edición cuando se hace clic en "Editar"
  function mostrarFormulario(id) {
    const form = document.getElementById(`formEditar-${id}`);
    form.style.display = form.style.display === "none" ? "block" : "none"; // Toggle entre mostrar/ocultar
  }

  // 🎚️ Mostrar/Ocultar Sidebar
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidenavAccordion');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar-collapsed');
    });
  }

  // 🏙️ DataTables para la tabla de camas
  $(document).ready(function() {
    $('#tablaCamas').DataTable({
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
      }
    });
  });
});
