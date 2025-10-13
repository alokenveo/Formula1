// Esta función carga un único componente y devuelve una promesa
async function cargarComponente(id, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.text();
        document.getElementById(id).innerHTML = data;
    } catch (error) {
        console.error(`Error cargando el componente ${url}:`, error);
        // Opcional: Muestra un error en la página si el componente no carga
        document.getElementById(id).innerHTML = `<p style="color:red;">Error al cargar componente.</p>`;
    }
}

// Esta función se llamará DESPUÉS de que todos los componentes se hayan cargado
function inicializarScriptsDependientes() {
    // Comprueba si la función de inicialización del usuario existe y la llama
    if (typeof initUsuarioLogic === 'function') {
        initUsuarioLogic();
    }
    // Si tuvieras otros scripts que dependen de componentes, los llamarías aquí
}

// Evento principal que se ejecuta cuando el HTML base está listo
document.addEventListener("DOMContentLoaded", async () => {
    // Carga todos los componentes en paralelo y espera a que todos terminen
    await Promise.all([
        cargarComponente("encabezado", "/html/componentes/header.html"),
        cargarComponente("pie", "/html/componentes/footer.html") // Asegúrate de tener un div con id="pie" para el footer
    ]);

    // Ahora que los componentes están en el DOM, podemos inicializar los scripts que los usan
    inicializarScriptsDependientes();
});