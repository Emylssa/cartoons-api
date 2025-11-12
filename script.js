
// Consome a Rick and Morty API e cria cards dinamicamente
const API_BASE = 'https://rickandmortyapi.com/api/character';
const cardsEl = document.getElementById('cards');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const searchEl = document.getElementById('search');
const statusFilterEl = document.getElementById('statusFilter');
const loadMoreBtn = document.getElementById('loadMore');

let page = 1;
let characters = [];

async function fetchCharacters(page=1) {
  loadingEl.style.display = 'block';
  errorEl.hidden = true;
  try {
    const res = await fetch(`${API_BASE}?page=${page}`);
    if (!res.ok) throw new Error('Erro ao buscar personagens: ' + res.status);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    errorEl.textContent = 'Falha ao carregar. Verifique a conexão e tente novamente.';
    errorEl.hidden = false;
    return null;
  } finally {
    loadingEl.style.display = 'none';
  }
}

function createCard(person) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('data-id', person.id);

  const fav = document.createElement('button');
  fav.className = 'fav';
  fav.innerHTML = '♡';
  fav.title = 'Favoritar';
  fav.addEventListener('click', () => {
    fav.classList.toggle('hearted');
    fav.innerHTML = fav.classList.contains('hearted') ? '❤' : '♡';
  });

  const img = document.createElement('img');
  img.className = 'avatar';
  img.src = person.image;
  img.alt = person.name;

  const h3 = document.createElement('h3');
  h3.textContent = person.name;

  const p = document.createElement('p');
  p.textContent = person.species + " — " + (person.origin?.name || 'Origem desconhecida');

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<span>Status: ${person.status}</span><span>Gênero: ${person.gender}</span>`;

  card.appendChild(fav);
  card.appendChild(img);
  card.appendChild(h3);
  card.appendChild(p);
  card.appendChild(meta);

  return card;
}

function renderList(list) {
  // limpa e renderiza
  cardsEl.innerHTML = '';
  if (!list || list.length === 0) {
    cardsEl.innerHTML = '<p>Nenhum personagem encontrado.</p>';
    return;
  }
  const frag = document.createDocumentFragment();
  list.forEach(person => frag.appendChild(createCard(person)));
  cardsEl.appendChild(frag);
}

function applyFilters() {
  const q = searchEl.value.trim().toLowerCase();
  const status = statusFilterEl.value;
  const filtered = characters.filter(p => {
    const matchesQ = p.name.toLowerCase().includes(q);
    const matchesStatus = (status === 'all') ? true : p.status === status;
    return matchesQ && matchesStatus;
  });
  renderList(filtered);
}

// inicialização
async function init() {
  const data = await fetchCharacters(page);
  if (!data) return;
  characters = data.results.slice();
  renderList(characters);

  // habilita carregar mais se houver próxima página
  if (data.info && data.info.next) {
    loadMoreBtn.disabled = false;
  } else {
    loadMoreBtn.disabled = true;
  }
}

loadMoreBtn.addEventListener('click', async () => {
  loadMoreBtn.disabled = true;
  page++;
  const data = await fetchCharacters(page);
  if (data && data.results) {
    characters = characters.concat(data.results);
    applyFilters();
    if (!data.info.next) loadMoreBtn.disabled = true;
  }
  loadMoreBtn.disabled = false;
});

searchEl.addEventListener('input', applyFilters);
statusFilterEl.addEventListener('change', applyFilters);

init();
