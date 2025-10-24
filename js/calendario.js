
document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTOS DEL DOM ---
    const monthNameEl = document.getElementById('month-name');
    const yearSelectEl = document.getElementById('year-select');
    const calendarDaysEl = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const modal = document.getElementById('gp-modal');
    const closeModalBtn = document.querySelector('.close-button');

    // --- ESTADO DEL CALENDARIO ---
    let currentDate = new Date();
    let raceData = [];

    // --- INICIALIZACIÓN ---
    async function init() {
        try {
            const response = await fetch('/resources/json/calendario.json');
            raceData = await response.json();
        } catch (error) {
            console.error("No se pudo cargar el calendario de carreras:", error);
        }

        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelectEl.appendChild(option);
        }

        // Añadir listeners a los controles
        prevMonthBtn.addEventListener('click', () => changeMonth(-1));
        nextMonthBtn.addEventListener('click', () => changeMonth(1));
        yearSelectEl.addEventListener('change', changeYear);
        closeModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (event) => {
            if (event.target == modal) closeModal();
        });

        // Renderizar el calendario inicial
        renderCalendar();
    }

    // --- LÓGICA DE RENDERIZADO ---
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Actualizar el header
        monthNameEl.textContent = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(currentDate);
        yearSelectEl.value = year;

        // Limpiar el calendario anterior
        calendarDaysEl.innerHTML = '';

        // Calcular los días del mes
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Dom, 1=Lun,...
        const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Ajuste para que Lunes sea 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Crear las celdas de los días
        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day', 'other-month');
            calendarDaysEl.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = i;
            dayCell.appendChild(dayNumber);

            // Comprobar si hay una carrera este día
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const race = raceData.find(r => r.date === dateString);

            if (race) {
                dayCell.classList.add('race-day');
                const gpInfo = document.createElement('div');
                gpInfo.classList.add('gp-info');
                gpInfo.textContent = race.gpName;
                dayCell.appendChild(gpInfo);
                dayCell.addEventListener('click', () => openModal(race));
            }

            calendarDaysEl.appendChild(dayCell);
        }
    }

    // --- LÓGICA DE NAVEGACIÓN ---
    function changeMonth(offset) {
        currentDate.setMonth(currentDate.getMonth() + offset);
        renderCalendar();
    }

    function changeYear() {
        const newYear = parseInt(yearSelectEl.value);
        currentDate.setFullYear(newYear);
        renderCalendar();
    }

    // --- LÓGICA DEL MODAL ---
    function openModal(race) {
        document.getElementById('modal-gp-name').textContent = race.gpName;
        document.getElementById('modal-circuit-name').textContent = race.circuitName;
        document.getElementById('modal-location').textContent = race.location;
        document.getElementById('modal-circuit-image').src = race.image;
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // Iniciar todo
    init();
});
