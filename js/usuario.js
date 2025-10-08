
document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENTOS DEL DOM ---
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const showLoginBtn = document.getElementById('show-login-modal');
    const loggedInOptions = document.getElementById('user-logged-in-options');
    const logoutBtn = document.getElementById('logout-btn');

    // --- LÓGICA DE ACTUALIZACIÓN DE UI ---
    function updateUserUI() {
        const currentUser = JSON.parse(localStorage.getItem('f1_currentUser'));
        if (currentUser) {
            // Usuario Logueado
            showLoginBtn.style.display = 'none';
            loggedInOptions.style.display = 'block';
        } else {
            // Usuario No Logueado
            showLoginBtn.style.display = 'block';
            loggedInOptions.style.display = 'none';
        }
    }

    // --- MANEJO DE MODALES ---
    function openModal(modal) {
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // Eventos para abrir/cerrar/cambiar modales
    document.getElementById('show-login-modal').addEventListener('click', (e) => { e.preventDefault(); openModal(loginModal); });
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

        // Obtenemos los usuarios existentes o creamos un array vacío
        const users = JSON.parse(localStorage.getItem('f1_users')) || [];

        // Comprobamos si el email ya existe
        if (users.some(user => user.email === email)) {
            alert('Este email ya está registrado.');
            return;
        }

        // Añadimos el nuevo usuario
        users.push({ name, email, password }); // En una app real, la contraseña debe ser encriptada
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
            // Guardamos el usuario actual en Local Storage
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
    // Al cargar la página, comprobar si hay un usuario logueado para mostrar el menú correcto
    updateUserUI();
});
