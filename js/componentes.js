// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    // Selecciona todos los elementos que tienen el atributo 'data-include'
    const elementsToInclude = document.querySelectorAll('[data-include]');

    // Itera sobre cada elemento encontrado
    elementsToInclude.forEach(el => {
        // Obtiene la ruta del archivo a incluir desde el atributo
        const fileUrl = el.getAttribute('data-include');

        // Usa fetch para obtener el contenido del archivo HTML
        fetch(fileUrl)
            .then(response => {
                // Si la respuesta no es OK (ej. error 404), lanza un error
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el archivo: ${fileUrl}`);
                }
                // Si la respuesta es OK, devuelve el contenido como texto
                return response.text();
            })
            .then(html => {
                // Inserta el HTML obtenido dentro del elemento contenedor
                el.innerHTML = html;
            })
            .catch(error => {
                // Si hay algún error, lo muestra en la consola y en el propio elemento
                console.error('Error al incluir el componente:', error);
                el.innerHTML = `<p style="color:red;">Error al cargar ${fileUrl}</p>`;
            });
    });
});