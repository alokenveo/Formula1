
document.addEventListener("DOMContentLoaded", () => {
    // --- Elementos del DOM ---
    const toggleView = document.getElementById('toggle-view');
    const cardsContainer = document.getElementById('cards-container');
    const switchLabels = document.querySelectorAll('.switch-label');

    // --- Datos ---
    let f1Data = { pilotos: [], escuderias: [] }; // Para almacenar los datos del JSON
    let currentView = 'pilotos'; // Estado inicial: mostrar pilotos

    // --- Cargar datos y renderizar al inicio ---
    async function init() {
        try {
            const response = await fetch('/resources/json/f1.json');
            f1Data = await response.json();
            renderCards(currentView); // Renderizar la vista inicial
        } catch (error) {
            console.error("Error al cargar los datos de F1:", error);
        }

        // Event listener para el switch
        toggleView.addEventListener('change', handleToggleChange);
    }

    // --- Función para renderizar las tarjetas ---
    function renderCards(type) {
        cardsContainer.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevas tarjetas
        const dataToRender = f1Data[type]; // Obtener los datos (pilotos o escuderías)

        dataToRender.forEach(item => {
            const cardHtml = createCard(item, type);
            cardsContainer.innerHTML += cardHtml; // Añadir el HTML de la tarjeta
        });

        // Actualizar las etiquetas del switch
        if (type === 'pilotos') {
            switchLabels[0].style.color = 'white';
            switchLabels[1].style.color = '#ccc';
        } else {
            switchLabels[0].style.color = '#ccc';
            switchLabels[1].style.color = 'white';
        }
    }

    // --- Función para crear el HTML de una tarjeta ---
    function createCard(item, type) {
        let backContent = '';
        let frontTeam = '';
        let cardImageSrc = item.image || ''; // Usa la imagen si existe, si no, vacío

        // Contenido para la parte trasera de la tarjeta (Pilotos)
        if (type === 'pilotos') {
            frontTeam = `<div class="card-team">${item.team}</div>`;
            backContent = `
                <div class="card-back-title">Estadísticas</div>
                <div class="card-back-info">
                    <p><span>Campeonatos:</span> <span>${item.backInfo.championships}</span></p>
                    <p><span>Victorias:</span> <span>${item.backInfo.wins}</span></p>
                    <p><span>Podios:</span> <span>${item.backInfo.podiums}</span></p>
                    <p><span>Debut:</span> <span>${item.backInfo.firstEntry}</span></p>
                </div>
            `;
        }
        // Contenido para la parte trasera de la tarjeta (Escuderías)
        else { // type === 'escuderias'
            frontTeam = `<div class="card-team">Team Principal: ${item.teamPrincipal}</div>`;
            backContent = `
                <div class="card-back-title">Estadísticas</div>
                <div class="card-back-info">
                    <p><span>Campeonatos:</span> <span>${item.backInfo.championships}</span></p>
                    <p><span>Victorias:</span> <span>${item.backInfo.wins}</span></p>
                    <p><span>Poles:</span> <span>${item.backInfo.poles}</span></p>
                    <p><span>Debut:</span> <span>${item.backInfo.firstEntry}</span></p>
                </div>
            `;
        }

        // Devuelve el HTML completo de la tarjeta (front y back)
        return `
            <div class="flip-card">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        ${cardImageSrc ? `<img src="${cardImageSrc}" alt="${item.name}" class="card-image">` : `<div class="card-image placeholder"></div>`}
                        <div class="card-country">${item.country}</div>
                        <div class="card-name">${item.name}</div>
                        ${frontTeam}
                    </div>
                    <div class="flip-card-back">
                        ${backContent}
                    </div>
                </div>
            </div>
        `;
    }

    // --- Manejar el cambio del switch (Pilotos/Escuderías) ---
    function handleToggleChange() {
        currentView = toggleView.checked ? 'escuderias' : 'pilotos';
        renderCards(currentView);
    }

    // Iniciar la aplicación
    init();
});
