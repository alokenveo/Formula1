document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTOS DEL DOM ---
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const resultsContainer = document.getElementById('news-results-container');

    // --- DATOS GLOBALES ---
    let allNews = [];

    // --- INICIALIZACIÓN ---
    async function initNews() {
        try {
            const response = await fetch('/resources/json/noticias.json');
            allNews = await response.json();
            renderNews(allNews); // Muestra todas las noticias al cargar la página
        } catch (error) {
            console.error("Error al cargar las noticias:", error);
            resultsContainer.innerHTML = "<p>No se pudieron cargar las noticias. Inténtalo de nuevo más tarde.</p>";
        }

        // Añadir listeners a los filtros
        searchInput.addEventListener('keyup', handleFilters);
        categoryFilter.addEventListener('change', handleFilters);
    }

    // --- LÓGICA DE FILTRADO ---
    function handleFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;

        let filteredNews = allNews.filter(news => {
            // Filtrar por categoría
            const categoryMatch = selectedCategory === 'all' || news.category === selectedCategory;

            // Filtrar por término de búsqueda
            const searchMatch = news.title.toLowerCase().includes(searchTerm) ||
                                news.summary.toLowerCase().includes(searchTerm) ||
                                news.tags.some(tag => tag.toLowerCase().includes(searchTerm));

            return categoryMatch && searchMatch;
        });

        renderNews(filteredNews);
    }

    // --- LÓGICA DE RENDERIZADO ---
    function renderNews(newsArray) {
        resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

        if (newsArray.length === 0) {
            resultsContainer.innerHTML = "<p>No se encontraron noticias con esos criterios.</p>";
            return;
        }

        newsArray.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');

            newsCard.innerHTML = `
                <img src="${news.image}" alt="${news.title}" class="news-card-image">
                <div class="news-card-content">
                    <div class="news-card-info">
                        <span class="news-card-category">${news.category}</span>
                        <span class="news-card-date">${news.date}</span>
                    </div>
                    <h3>${news.title}</h3>
                    <p>${news.summary}</p>
                    <a href="#" class="news-card-readmore">Leer más &rarr;</a>
                </div>
            `;
            resultsContainer.appendChild(newsCard);
        });
    }

    // Iniciar el módulo de noticias
    initNews();
});