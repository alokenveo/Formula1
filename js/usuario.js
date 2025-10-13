// Envolvemos toda la lógica en una función que será llamada por componentes.js
function initUsuarioLogic() {
    
    // --- ELEMENTOS DEL DOM ---
    // Ahora estamos seguros de que estos elementos existen en la página
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const showLoginBtn = document.getElementById('show-login-modal');
    const loggedInOptions = document.getElementById('user-logged-in-options');
    const logoutBtn = document.getElementById('logout-btn');

    // --- LÓGICA DE ACTUALIZACIÓN DE UI ---
    function updateUserUI() {
        const currentUser = JSON.parse(localStorage.getItem('f1_currentUser'));
        if (currentUser) {
            showLoginBtn.style.display = 'none';
            loggedInOptions.style.display = 'block';
        } else {
            showLoginBtn.style.display = 'block';
            loggedInOptions.style.display = 'none';
        }
    }

    // --- MANEJO DE MODALES ---
    function openModal(modal) {
        if(modal) modal.style.display = 'block';
    }

    function closeModal(modal) {
        if(modal) modal.style.display = 'none';
    }

    // Eventos para abrir/cerrar/cambiar modales
    showLoginBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(loginModal); });
    document.getElementById('show-register-modal').addEventListener('click', (e) => { e.preventDefault(); closeModal(loginModal); openModal(registerModal); });
    document.getElementById('switch-to-login-modal').addEventListener('click', (e) => { e.preventDefault(); closeModal(registerModal); openModal(loginModal); });

    loginModal.querySelector('.close-button').addEventListener('click', () => closeModal(loginModal));
    registerModal.querySelector('.close-button').addEventListener('click', () => closeModal(registerModal));

    window.onclick = function (event) {
        if (event.target == loginModal) closeModal(loginModal);
        if (event.target == registerModal) closeModal(registerModal);
    }

    // --- LÓGICA DE AUTENTICACIÓN ---
    // Registro
    document.getElementById('register-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (password !== passwordConfirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('f1_users')) || [];
        if (users.some(user => user.email === email)) {
            alert('Este email ya está registrado.');
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('f1_users', JSON.stringify(users));

        alert('¡Registro completado! Por favor, inicia sesión.');
        closeModal(registerModal);
        openModal(loginModal);
    });

    // Inicio de Sesión
    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const users = JSON.parse(localStorage.getItem('f1_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('f1_currentUser', JSON.stringify({ name: user.name, email: user.email }));
            alert(`¡Bienvenido de nuevo, ${user.name}!`);
            closeModal(loginModal);
            updateUserUI();
        } else {
            alert('Email o contraseña incorrectos.');
        }
    });

    // Cerrar Sesión
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('f1_currentUser');
        alert('Has cerrado sesión.');
        updateUserUI();
    });

    // --- ESTADO INICIAL ---
    updateUserUI();
}