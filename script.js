// Global variables
const pokemonContainer = document.getElementById('PokemonContainer');
const form1 = document.getElementById('Form');
const form2 = document.getElementById('Form2');
const filterSelect = document.getElementById('Filter');

// Event Listeners
form1.addEventListener('submit', handleSinglePokemonSearch);
form2.addEventListener('submit', handleMultiplePokemonSearch);
filterSelect.addEventListener('change', handleFilterChange);

// Handler for searching a single Pokemon
function handleSinglePokemonSearch(event) {
    event.preventDefault();
    const name = document.getElementById('PokemonName').value;
    fetchSinglePokemon(name);
}

// Handler for searching multiple Pokemon
function handleMultiplePokemonSearch(event) {
    event.preventDefault();
    const number = parseInt(document.getElementById('NumberOfPokemon').value);
    const type = filterSelect.value;
    if (isNaN(number) || number < 1 || number > 100) {
        displayError("Please enter a valid number between 1 and 100.");
        return;
    }
    fetchMultiplePokemon(number, type);
}

// Handler for filter change
function handleFilterChange() {
    const number = parseInt(document.getElementById('NumberOfPokemon').value);
    const type = filterSelect.value;
    if (!isNaN(number) && number >= 1 && number <= 100) {
        fetchMultiplePokemon(number, type);
    }
}

// Fetch a single Pokemon
async function fetchSinglePokemon(name) {
    displayLoading();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) throw new Error('Pokemon not found');
        const data = await response.json();
        displayPokemon([data]);
    } catch (error) {
        console.error("Error:", error);
        displayError("Failed to fetch Pokemon. Please try again.");
    }
}

// Fetch multiple Pokemon
async function fetchMultiplePokemon(number, type) {
    displayLoading();
    try {
        let pokemonList;
        if (type.toLowerCase() === 'all') {
            pokemonList = await fetchRandomPokemon(number);
        } else {
            pokemonList = await fetchPokemonByType(type, number);
        }
        displayPokemon(pokemonList);
    } catch (error) {
        console.error("Error:", error);
        displayError("Failed to fetch Pokemon. Please try again.");
    }
}

// Fetch random Pokemon
async function fetchRandomPokemon(number) {
    const promises = [];
    for (let i = 0; i < number; i++) {
        const id = Math.floor(Math.random() * 898) + 1; // There are 898 Pokemon in the API
        promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()));
    }
    return Promise.all(promises);
}

// Fetch Pokemon by type
async function fetchPokemonByType(type, limit) {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
    const data = await response.json();
    const pokemonUrls = data.pokemon.slice(0, limit).map(p => p.pokemon.url);
    const promises = pokemonUrls.map(url => fetch(url).then(res => res.json()));
    return Promise.all(promises);
}

// Display Pokemon
function displayPokemon(pokemonList) {
    pokemonContainer.innerHTML = '';
    pokemonList.forEach(pokemon => {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p><strong>Type(s):</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
            <div class="stats">
                <p><strong>HP:</strong> ${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</p>
                <p><strong>Attack:</strong> ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</p>
                <p><strong>Defense:</strong> ${pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat}</p>
                <p><strong>Speed:</strong> ${pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat}</p>
            </div>
        `;
        pokemonContainer.appendChild(card);
    });
}

// Display error message
function displayError(message) {
    pokemonContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}

// Display loading message
function displayLoading() {
    pokemonContainer.innerHTML = '<p>Loading...</p>';
}