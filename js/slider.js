document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slider .slide');
    if (slides.length === 0) return; // No hacer nada si no hay slides

    let currentSlideIndex = 0;
    const slideInterval = 8000; // 8 segundos por slide (puedes cambiarlo)

    function showNextSlide() {
        // Oculta el slide actual
        slides[currentSlideIndex].classList.remove('active-slide');

        // Calcula el índice del siguiente slide
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;

        // Muestra el nuevo slide
        const newSlide = slides[currentSlideIndex];
        newSlide.classList.add('active-slide');

        // Si el nuevo slide es un video, asegúrate de que se reproduzca desde el inicio
        const video = newSlide.querySelector('video');
        if (video) {
            video.currentTime = 0; // Reinicia el video
            video.play();
        }
    }

    // Inicia el carrusel
    setInterval(showNextSlide, slideInterval);
});