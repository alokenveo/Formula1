// Esta función carga un único componente y devuelve una promesa
async function cargarComponente(id, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.text();
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = data;
        }
    } catch (error) {
        console.error(`Error cargando el componente ${url}:`, error);
    }
}

// Esta función se llamará DESPUÉS de que todos los componentes se hayan cargado
function inicializarScriptsDependientes() {
    // Llama a la lógica del menú
    if (typeof initMenuLogic === 'function') {
        initMenuLogic();
    }
    // Llama a la lógica del usuario (login/logout)
    if (typeof initUsuarioLogic === 'function') {
        initUsuarioLogic();
    }
}

// Evento principal que se ejecuta cuando el HTML base está listo
document.addEventListener("DOMContentLoaded", async () => {
    // Carga todos los componentes en paralelo y espera a que todos terminen
    await Promise.all([
        cargarComponente("encabezado", "/html/componentes/header.html"),
        cargarComponente("pie", "/html/componentes/footer.html")
    ]);

    // Ahora que los componentes están en el DOM, inicializamos los scripts que los usan
    inicializarScriptsDependientes();
});