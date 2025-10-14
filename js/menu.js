// Envolvemos toda la lógica en una función que será llamada por componentes.js
function initMenuLogic() {
    
    // Selecciona el botón de hamburguesa y el menú de enlaces
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.getElementById('nav-links-menu');

    // Comprueba que ambos elementos existen antes de añadir el evento
    // (Ahora estamos seguros de que existirán cuando se llame a esta función)
    if (hamburger && navLinks) {
        // Añade un evento de "click" al botón de hamburguesa
        hamburger.addEventListener('click', () => {
            // Al hacer click, añade o quita la clase "active" del menú
            navLinks.classList.toggle('active');
        });
    }
}