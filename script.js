const API_KEY = "93495b6b4e197c822af8927a43b834f2";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const yearFilter = document.getElementById("yearFilter");
const results = document.getElementById("results");
const noResults = document.getElementById("noResults");

async function fetchMovies(query = "", year = "") {
  try {
    let endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ru-RU&page=1`;
    if (query) {
      endpoint = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(
        query
      )}&page=1`;
    }
    if (year) {
      endpoint += `&year=${year}`;
    }

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Ошибка API");
    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Ошибка загрузки данных. Проверьте API ключ.");
    return [];
  }
}

function renderMovies(movies) {
  results.innerHTML = "";
  noResults.style.display = "none";

  if (movies.length === 0) {
    noResults.style.display = "block";
    return;
  }

  movies.forEach((movie, index) => {
    const card = document.createElement("div");
    card.className = "col-md-4 col-lg-3 mb-4";
    card.innerHTML = `
            <div class="card movie-card h-100">
                <img src="${
                  movie.poster_path
                    ? IMAGE_BASE + movie.poster_path
                    : "https://via.placeholder.com/500x300?text=No+Image"
                }" 
                     class="card-img-top" alt="${movie.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${movie.title}</h5>
                    <p class="card-text flex-grow-1">${
                      movie.overview
                        ? movie.overview.substring(0, 100) + "..."
                        : "Описание отсутствует"
                    }</p>
                    <div class="mt-auto">
                        <small class="text-muted">Рейтинг: ${
                          movie.vote_average
                        }/10</small><br>
                        <small class="text-muted">Год: ${
                          movie.release_date
                            ? movie.release_date.substring(0, 4)
                            : "Неизвестно"
                        }</small>
                    </div>
                </div>
            </div>
        `;
    card.style.animationDelay = `${index * 0.1}s`;
    results.appendChild(card);
  });
}

async function handleSearch(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  const year = yearFilter.value;

  if (!query && !year) {
    const movies = await fetchMovies();
    renderMovies(movies);
    return;
  }

  const movies = await fetchMovies(query, year);
  renderMovies(movies);
}

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.style.display = "none";
  searchInput.placeholder = "Введите название фильма...";
  fetchMovies().then((movies) => renderMovies(movies));
});

searchInput.addEventListener("input", () => {
  clearBtn.style.display = searchInput.value ? "block" : "none";
  if (!searchInput.value) {
    searchInput.placeholder = "Введите название фильма...";
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch(e);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies().then((movies) => renderMovies(movies));
});

searchForm.addEventListener("submit", handleSearch);
yearFilter.addEventListener("change", () => {
  if (searchInput.value) handleSearch({ preventDefault: () => {} });
});
