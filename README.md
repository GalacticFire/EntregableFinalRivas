# EntregableFinalRivas
Trabajo final de Coderhouse. 



Integración con The Movie Database (TMDb): La aplicación ya no solo guarda películas, sino que ahora se conecta con la API pública de TMDb para buscar y obtener información real de las películas.

Búsqueda con autocompletado: Se añadió la librería Awesomplete al campo de título. Ahora, al escribir, se muestran sugerencias de películas de la API, completando automáticamente la información como el póster, la sinopsis y el año de estreno.

Modo oscuro/claro: Se agregó un botón para cambiar entre modo claro y modo oscuro, guardando la preferencia del usuario en el localStorage.

Validación de formularios: Antes de guardar una película, ahora se valida que el título y la reseña no estén vacíos, y que el puntaje sea un número entero entre 1 y 10. Se muestra un mensaje de error claro al usuario si la validación falla.

Información extendida en la tarjeta: Las tarjetas de películas ahora muestran el póster, la sinopsis y el año de estreno.

Tarjetas expandibles: Se añadió un botón "Ver más" que permite expandir la reseña y la sinopsis si son demasiado largas.
