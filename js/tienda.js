document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTOS DEL DOM ---
    // Selectores para los filtros
    const productTypeFilter = document.getElementById('product-type');
    const priceRangeFilter = document.getElementById('price-range');
    const priceValueSpan = document.getElementById('price-value');
    const sizeCheckboxes = document.querySelectorAll('.size-checkboxes input[type="checkbox"]');
    const productsGrid = document.getElementById('products-grid');

    // Selectores para el carrito
    const cartCounterEl = document.getElementById('cart-counter');
    const cartBtn = document.querySelector('.cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // --- DATOS GLOBALES ---
    let allProducts = [];
    let cart = []; // El carrito de compras

    // --- FUNCIONES DE INICIALIZACIÓN ---
    async function initShop() {
        try {
            // Asegúrate que la ruta a tu archivo de productos sea correcta
            const response = await fetch('/resources/json/productos.json');
            allProducts = await response.json();
            loadCart(); // Cargar el carrito desde Local Storage al inicio
            renderProducts(allProducts); // Mostrar todos los productos
            setupFilterListeners(); // Activar los filtros
            setupModalListeners(); // Activar los modales del carrito
        } catch (error) {
            console.error("Error al cargar los productos:", error);
        }
    }

    // ESTA ES LA FUNCIÓN QUE PROBABLEMENTE FALTABA O ESTABA INCOMPLETA
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
    
    function setupModalListeners() {
        cartBtn.addEventListener('click', openCartModal);
        cartModal.querySelector('.close-button').addEventListener('click', () => cartModal.style.display = 'none');
        checkoutBtn.addEventListener('click', handleCheckout);
    }
    
    // --- LÓGICA DE FILTRADO ---
    function applyFilters() {
        let tempProducts = [...allProducts];

        // 1. Filtrar por Tipo
        const selectedType = productTypeFilter.value;
        if (selectedType !== 'all') {
            tempProducts = tempProducts.filter(product => product.type === selectedType);
        }

        // 2. Filtrar por Precio
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

        renderProducts(tempProducts);
    }

    // --- LÓGICA DEL CARRITO ---
    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCartUI();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCartItems();
    }
    
    function clearCart() {
        cart = [];
        saveCart();
        updateCartUI();
    }

    function calculateTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartCounterEl.textContent = totalItems;
            cartCounterEl.style.display = 'flex';
        } else {
            cartCounterEl.style.display = 'none';
        }
    }

    function saveCart() {
        const currentUser = JSON.parse(localStorage.getItem('f1_currentUser'));
        if (currentUser && currentUser.email) {
            localStorage.setItem(`f1_cart_${currentUser.email}`, JSON.stringify(cart));
        } else {
            sessionStorage.setItem('f1_cart_guest', JSON.stringify(cart));
        }
    }

    function loadCart() {
        const currentUser = JSON.parse(localStorage.getItem('f1_currentUser'));
        let savedCart = null;
        if (currentUser && currentUser.email) {
            savedCart = localStorage.getItem(`f1_cart_${currentUser.email}`);
        } else {
            savedCart = sessionStorage.getItem('f1_cart_guest');
        }
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        updateCartUI();
    }

    // --- RENDERIZADO Y MODALES ---
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #ccc;">No se encontraron productos con estos filtros.</p>';
            return;
        }
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
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
    
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-message">Tu carrito está vacío.</p>';
            checkoutBtn.disabled = true;
        } else {
            cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>Cantidad: ${item.quantity}</p>
                    </div>
                    <p class="cart-item-price">${(item.price * item.quantity).toFixed(2)}€</p>
                    <button class="remove-item-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
            checkoutBtn.disabled = false;
        }
        cartTotalPriceEl.textContent = `${calculateTotal().toFixed(2)}€`;
    }
    
    function openCartModal() {
        renderCartItems();
        cartModal.style.display = 'flex';
    }

    function handleCheckout() {
        cartModal.style.display = 'none';
        confirmationModal.style.display = 'flex';
        setTimeout(() => {
            confirmationModal.style.display = 'none';
            clearCart();
        }, 3000);
    }

    // --- EVENT LISTENERS ---
    productsGrid.addEventListener('click', (e) => {
        const button = e.target.closest('.add-to-cart-btn');
        if (button) {
            const productId = parseInt(button.dataset.productId);
            addToCart(productId);
        }
    });
    
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        }
    });

    // --- INICIALIZAR LA TIENDA ---
    initShop();
});