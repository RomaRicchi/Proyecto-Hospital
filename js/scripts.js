/*!
    * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2023 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    // 
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});

function obtenerFechaHoraFormateada() {
    const date = new Date();
    const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  
    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();
  
    // Capitalizar el nombre del día de la semana y del mes
    const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  
    // Obtener la hora, minutos y segundos con formato de dos dígitos
    let horas = date.getHours();
    let minutos = date.getMinutes();
    let segundos = date.getSeconds();
  
    horas = (horas < 10 ? "0" : "") + horas;
    minutos = (minutos < 10 ? "0" : "") + minutos;
    segundos = (segundos < 10 ? "0" : "") + segundos;
  
    return `${diaSemanaCapitalizado} ${dia} de ${mesCapitalizado} del ${anio} ${horas}:${minutos}:${segundos}`;
  }
  
  function actualizarFechaHora() {
    const elementoFechaHora = document.getElementById("fecha-hora");
    if (elementoFechaHora) {
      elementoFechaHora.textContent = obtenerFechaHoraFormateada();
    }
  }
  
  // Espera a que el DOM se cargue
  document.addEventListener('DOMContentLoaded', function() {
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 1000);
  });
  