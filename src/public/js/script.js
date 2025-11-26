// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {

	function actualizarReloj() {
		const reloj = document.getElementById('reloj');
		if (reloj) {
			const ahora = new Date();
			const dias = [
				'Domingo',
				'Lunes',
				'Martes',
				'Miércoles',
				'Jueves',
				'Viernes',
				'Sábado',
			];
			const meses = [
				'Enero',
				'Febrero',
				'Marzo',
				'Abril',
				'Mayo',
				'Junio',
				'Julio',
				'Agosto',
				'Septiembre',
				'Octubre',
				'Noviembre',
				'Diciembre',
			];
			const fechaFormateada = `${dias[ahora.getDay()]} ${ahora.getDate()} de ${
				meses[ahora.getMonth()]
			} del año ${ahora.getFullYear()} - ${ahora
				.getHours()
				.toString()
				.padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
			reloj.textContent = fechaFormateada;
		}
	}
	setInterval(actualizarReloj, 1000);
	actualizarReloj();

	const cards = document.querySelectorAll('.expandible');
	cards.forEach((card) => {
		card.addEventListener('click', (e) => {
			e.stopPropagation();
			cards.forEach((c) => c.classList.remove('expandida'));
			card.classList.add('expandida');
		});
	});
	document.addEventListener('click', () => {
		cards.forEach((c) => c.classList.remove('expandida'));
	});

	const sidebarToggle = document.getElementById('sidebarToggle');
	const sidebar = document.getElementById('sidenavAccordion');
	if (sidebarToggle) {
		sidebarToggle.addEventListener('click', () => {
			sidebar.classList.toggle('sidebar-collapsed');
		});
	}
});
