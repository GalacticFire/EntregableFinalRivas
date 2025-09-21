//  Uso la api publica de themoviedb.org
const API_KEY = "d9ea5812d12b27a5995e00bd1997d493";

const inputTitulo = document.getElementById("inputTitle");
const inputPuntaje = document.getElementById("inputPoints");
const inputResena = document.getElementById("inputReview");
const toggleBtn = document.getElementById("toggleMode");
const body = document.body;

let peliculaSeleccionada = null;
let peliculas = JSON.parse(localStorage.getItem("misPeliculas")) || [];

// Autocompletado con Libreria Awesomplete

const awesomplete = new Awesomplete(inputTitulo, {
  minChars: 3,
  maxItems: 5,
  autoFirst: true,
});

// Sobreescribo la forma en que se pinta el item, para permitir HTML (con la portada)
Awesomplete.ITEM = function (text, input) {
  const li = document.createElement("li");
  li.innerHTML = text; // no usa <mark>, muestra tal cual el HTML
  return li;
};

inputTitulo.addEventListener("input", () => {
  const query = inputTitulo.value.trim();
  if (query.length < 3) return;

  axios
    .get("https://api.themoviedb.org/3/search/movie", {
      params: {
        api_key: API_KEY,
        query,
        language: "es-ES",
      },
    })
    .then((res) => {
      const resultados = res.data.results.slice(0, 5);

      awesomplete.list = resultados.map((peli) => {
        const year = peli.release_date
          ? ` (${peli.release_date.substring(0, 4)})`
          : "";

        const imgTag = peli.poster_path
          ? `<img src="https://image.tmdb.org/t/p/w45${peli.poster_path}" 
                 alt="${peli.title}" 
                 style="width:30px; height:auto; margin-right:8px; vertical-align:middle; border-radius:4px;">`
          : "";

        return {
          label: `${imgTag}${peli.title}${year}`,
          value: peli.title,
          poster: peli.poster_path,
          sinopsis: peli.overview,
          year: year,
        };
      });

      inputTitulo.dataset.results = JSON.stringify(resultados);
    })
    .catch((err) => console.error(err));
});

inputTitulo.addEventListener("awesomplete-selectcomplete", (event) => {
  const resultados = JSON.parse(inputTitulo.dataset.results || "[]");
  const peli = resultados.find((p) => p.title === event.text.value);

  if (peli) {
    peliculaSeleccionada = {
      titulo: peli.title,
      poster: peli.poster_path,
      sinopsis: peli.overview,
      year: peli.release_date ? peli.release_date.substring(0, 4) : "N/A",
    };
  }
});

// Mostrar pelis guardadas

function mostrarPeliculas() {
  const contenedor = document.getElementById("movieList");
  contenedor.innerHTML = "";

  peliculas.forEach((peli, i) => {
    const card = document.createElement("div");
    card.className = "peliculas-card";

    if (peli.poster) {
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w300/${peli.poster}`;
      img.alt = peli.titulo;
      img.className = "poster";
      card.appendChild(img);
    }

    const info = document.createElement("div");
    info.className = "info-container";

    const titulo = document.createElement("h3");
    titulo.textContent = peli.year
      ? `${peli.titulo} (${peli.year})`
      : peli.titulo;

    const puntaje = document.createElement("p");
    puntaje.innerHTML = `<strong>Puntaje: </strong><span class="puntaje">${peli.puntaje}</span>`;

    const resena = document.createElement("p");
    const sinopsis = document.createElement("p");

    const fullResena = peli.resena || "Sin reseña";
    const shortResena =
      fullResena.length > 150
        ? fullResena.substring(0, 150) + "..."
        : fullResena;

    const fullSinopsis = peli.sinopsis || "Sin sinopsis disponible";
    const shortSinopsis =
      fullSinopsis.length > 150
        ? fullSinopsis.substring(0, 150) + "..."
        : fullSinopsis;

    resena.innerHTML = `<strong>Mi Reseña: </strong><span class="resena">${shortResena}</span>`;
    resena.classList.add("colapsable");

    sinopsis.innerHTML = `<strong>Sinopsis: </strong><span class="sinopsis">${shortSinopsis}</span>`;
    sinopsis.classList.add("colapsable");

    const btnVerMas = document.createElement("button");
    btnVerMas.textContent = "Ver más";
    btnVerMas.className = "ver-mas-btn";

    let expandido = false;
    btnVerMas.addEventListener("click", () => {
      if (!expandido) {
        resena.querySelector(".resena").textContent = fullResena;
        sinopsis.querySelector(".sinopsis").textContent = fullSinopsis;
        btnVerMas.textContent = "Ver menos";
      } else {
        resena.querySelector(".resena").textContent = shortResena;
        sinopsis.querySelector(".sinopsis").textContent = shortSinopsis;
        btnVerMas.textContent = "Ver más";
      }
      expandido = !expandido;
    });

    const btnBorrar = document.createElement("button");
    btnBorrar.className = "btn";
    btnBorrar.textContent = "X";
    btnBorrar.addEventListener("click", () => {
      peliculas.splice(i, 1);
      localStorage.setItem("misPeliculas", JSON.stringify(peliculas));
      mostrarPeliculas();
    });

    info.appendChild(titulo);
    info.appendChild(puntaje);
    info.appendChild(resena);
    info.appendChild(sinopsis);
    info.appendChild(btnVerMas);

    card.appendChild(info);
    card.appendChild(btnBorrar);
    contenedor.appendChild(card);
  });
}

// Agregar nueva película
function agregarPelicula() {
  const titulo = inputTitulo.value.trim();
  const puntaje = inputPuntaje.value.trim();
  const resena = inputResena.value.trim();

  // Validaciones
  if (!titulo) {
    mostrarError("El título no puede estar vacío.");
    return;
  }

  if (!puntaje || isNaN(puntaje) || !Number.isInteger(Number(puntaje))) {
    mostrarError("El puntaje debe ser un número entero.");
    return;
  }

  const puntajeNum = parseInt(puntaje, 10);
  if (puntajeNum < 1 || puntajeNum > 10) {
    mostrarError("El puntaje debe estar entre 1 y 10.");
    return;
  }

  if (!resena) {
    mostrarError("La reseña no puede estar vacía.");
    return;
  }

  const peli = {
    titulo: titulo,
    puntaje: puntajeNum,
    resena: resena,
    poster: peliculaSeleccionada ? peliculaSeleccionada.poster : null,
    sinopsis: peliculaSeleccionada ? peliculaSeleccionada.sinopsis : null,
    year: peliculaSeleccionada ? peliculaSeleccionada.year : "N/A",
  };

  peliculas.push(peli);
  localStorage.setItem("misPeliculas", JSON.stringify(peliculas));
  mostrarPeliculas();

  inputTitulo.value = "";
  inputPuntaje.value = "";
  inputResena.value = "";
  peliculaSeleccionada = null;
}

document
  .getElementById("btnAddMovie")
  .addEventListener("click", agregarPelicula);

// Modo oscuro/claro

if (localStorage.getItem("tema") === "claro") {
  body.classList.add("modoClaro");
  toggleBtn.textContent = "🌙";
} else {
  toggleBtn.textContent = "☀️";
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("modoClaro");

  if (body.classList.contains("modoClaro")) {
    localStorage.setItem("tema", "claro");
    toggleBtn.textContent = "🌙";
  } else {
    localStorage.setItem("tema", "oscuro");
    toggleBtn.textContent = "☀️";
  }
});

// Sistema de errores

function mostrarError(mensaje) {
  let errorBox = document.getElementById("errorBox");

  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.id = "errorBox";
    document.body.appendChild(errorBox);
  }

  errorBox.textContent = mensaje;
  errorBox.style.display = "block";

  setTimeout(() => {
    errorBox.style.display = "none";
  }, 3000);
}

// Inicializacion

mostrarPeliculas();
