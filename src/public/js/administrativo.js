import { validarTexto } from './utils/validacionesImput.js';

$(document).ready(function () {
  const $tabla = $('#tablaAdministrativo');
  if (!$tabla.length) return;

  fetch('/api/personal-administrativo')
    .then(r => r.json())
    .then(lista => {
      const dataSet = lista.map(a => [
        a.apellido,
        a.nombre,
        (a.rol && a.rol.nombre) ? a.rol.nombre : '',
        a.activo ? 'Activo' : 'Inactivo',
        `
          <button class="btn btn-sm btn-primary me-1 edit-btn" data-id="${a.id_personal_admin}">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${a.id_personal_admin}">
            <i class="fas fa-trash"></i>
          </button>
        `
      ]);
  
      const dt = $tabla.DataTable({
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
        data: dataSet,
        columns: [
          { title: 'Apellido' },
          { title: 'Nombre' },
          { title: 'Rol' },
          { title: 'Estado' }, 
          { title: 'Acciones', orderable: false, searchable: false }
        ],
        pageLength: 10,
        responsive: true,
        destroy: true
      });
    });

  $(document).on('click', '.edit-btn', function () {
    const id = $(this).data('id');
    fetch(`/api/personal-administrativo/${id}`)
      .then(r=>r.json())
      .then(a=>{
        Swal.fire({
          title: 'Editar administrativo',
          html: `
            <div style="max-width: 350px; margin: 0 auto;">
              <label class="form-label text-start d-block"><strong>Apellido:</strong></label>
              <input id="apellido" class="form-control mb-2" value="${a.apellido}" placeholder="Apellido">

              <label class="form-label text-start d-block"><strong>Nombre:</strong></label>
              <input id="nombre" class="form-control mb-2" value="${a.nombre}" placeholder="Nombre">

              <label class="form-label text-start d-block"><strong>Estado:</strong></label>
              <select id="estado" class="form-select mb-2 text-dark">
                <option value="true" ${a.activo ? 'selected' : ''}>Activo</option>
                <option value="false" ${!a.activo ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          customClass: {
            popup: 'swal2-card-style'
          },
          preConfirm: () => {
            const apellido = $('#apellido').val();
            const nombre = $('#nombre').val();
            const activo = $('#estado').val() === 'true';

            const err =
              validarTexto(apellido, 'Apellido') ||
              validarTexto(nombre, 'Nombre');
            if (err) {
              Swal.showValidationMessage(err);
              return false;
            }

            return {
              apellido: apellido.trim(),
              nombre: nombre.trim(),
              activo
            };
          }
        }).then(r=>{
          if(!r.isConfirmed) return;
          fetch(`/api/personal-administrativo/${id}`,{
            method:'PUT',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(r.value)
          })
          .then(res=>{ if(!res.ok) throw new Error(); return res.json(); })
          .then(()=> Swal.fire('Actualizado', 'Registro modificado', 'success')
                         .then(()=>location.reload()))
          .catch(()=> Swal.fire('Error','No se pudo actualizar','error'));
        });
      })
      .catch(()=> Swal.fire('Error','No se pudo cargar el registro','error'));
  });

  $(document).on('click','.delete-btn',function(){
    const id=$(this).data('id');
    Swal.fire({
      title:'¿Dar de baja?',
      icon:'warning',
      showCancelButton:true,
      confirmButtonText:'Sí, continuar',
      cancelButtonText:'Cancelar',
      customClass: {
        popup: 'swal2-card-style'
      },
    }).then(r=>{
      if(!r.isConfirmed) return;
      fetch(`/api/personal-administrativo/${id}`,{ method:'DELETE' })
        .then(res=>{
          if(res.status===409) throw new Error('No se puede eliminar: en uso.');
          if(!res.ok) throw new Error();
          return res.json();
        })
        .then(()=> Swal.fire('Baja exitosa','Registro eliminado','success')
                       .then(()=>location.reload()))
        .catch(err=> Swal.fire('Error',err.message||'No se pudo eliminar','error'));
    });
  });
});
