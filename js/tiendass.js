
document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTOS DEL DOM ---
    const productTypeFilter = document.getElementById('product-type');
    const priceRangeFilter = document.getElementById('price-range');
    const priceValueSpan = document.getElementById('price-value');
    const sizeCheckboxes = document.querySelectorAll('.size-checkboxes input[type="checkbox"]');
    const productsGrid = document.getElementById('products-grid');

    // --- DATOS GLOBALES ---
    let allProducts = []; // Almacenará todos los productos cargados del JSON
    let filteredProducts = []; // Almacenará los productos después de aplicar filtros

    // --- FUNCIONES DE INICIALIZACIÓN ---
    async function initShop() {
        try {
            const response = await fetch('/resources/json/productos.json');
            allProducts = await response.json();
            renderProducts(allProducts); // Mostrar todos los productos al inicio
            setupFilterListeners();
        } catch (error) {
            console.error("Error al cargar los productos de la tienda:", error);
        }
    }

    function setupFilterListeners() {
        productTypeFilter.addEventListener('change', applyFilters);
        priceRangeFilter.addEventListener('input', () => {
            priceValueSpan.textContent = `0-${priceRangeFilter.value}€`;
            applyFilters();
        });
        sizeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
    }

    // --- FUNCIONES DE RENDERIZADO ---
    function renderProducts(products) {
        productsGrid.innerHTML = ''; // Limpiar la cuadrícula
        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #ccc;">No se encontraron productos con estos filtros.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // HTML de la tarjeta del producto
            productCard.innerHTML = `
                <div class="product-image-container">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : `<div class="product-image placeholder"></div>`}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price.toFixed(2)}€</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        Añadir al carrito
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }

    // --- LÓGICA DE FILTRADO ---
    function applyFilters() {
        let tempProducts = [...allProducts]; // Copia de todos los productos para filtrar

        // 1. Filtrar por Tipo de Producto
        const selectedType = productTypeFilter.value;
        if (selectedType !== 'all') {
            tempProducts = tempProducts.filter(product => product.type === selectedType);
        }

        // 2. Filtrar por Rango de Precio
        const maxPrice = parseFloat(priceRangeFilter.value);
        tempProducts = tempProducts.filter(product => product.price <= maxPrice);

        // 3. Filtrar por Tamaño
        const selectedSizes = Array.from(sizeCheckboxes)
                                   .filter(checkbox => checkbox.checked)
                                   .map(checkbox => checkbox.value);

        if (selectedSizes.length > 0) {
            tempProducts = tempProducts.filter(product => 
                product.sizes.some(size => selectedSizes.includes(size))
            );
        }

        filteredProducts = tempProducts;
        renderProducts(filteredProducts);
    }

    // --- LÓGICA DEL CARRITO (básica, puedes expandirla) ---
    productsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
            const button = e.target.closest('.add-to-cart-btn');
            const productId = parseInt(button.dataset.productId);
            const productToAdd = allProducts.find(p => p.id === productId);
            
            if (productToAdd) {
                // Aquí podrías añadir el producto a un array 'cartItems' en localStorage
                // Por ahora, solo alertamos
                alert(`"${productToAdd.name}" añadido al carrito! (ID: ${productId})`);
            }
        }
    });


    // --- INICIALIZAR LA TIENDA ---
    initShop();
});
