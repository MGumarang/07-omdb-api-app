// Select the search form and movie results container
const searchForm = document.getElementById('search-form');
const movieResults = document.getElementById('movie-results');

const watchlistStorageKey = 'watchlist';
const savedWatchlist = JSON.parse(localStorage.getItem(watchlistStorageKey)) || [];
const watchlist = new Set(savedWatchlist.map((movie) => movie.imdbID)); // Create a Set to store the watchlist movies, ensuring that each movie is unique and preventing duplicates
const watchlistContainer = document.getElementById('watchlist'); // Select the watchlist container to display the watchlist movies

const saveWatchlist = (movies) => {
  localStorage.setItem(watchlistStorageKey, JSON.stringify(movies)); // Save the watchlist movies to localStorage as a JSON string, allowing the watchlist to persist across page reloads and browser sessions
};

// Function to render the watchlist on the page. It clears the watchlist container and generates HTML content for each movie in the saved watchlist. If the watchlist is empty, it displays a message indicating that the watchlist is empty.
const renderWatchlist = () => {
  watchlistContainer.innerHTML = '';

  // Check if the saved watchlist is empty. If it is, display a message indicating that the watchlist is empty and prompt the user to search for movies to add.
  if (savedWatchlist.length === 0) {
    watchlistContainer.innerHTML = '<p class="no-results">Your watchlist is empty. Search for movies to add!</p>';
    return;
  }

  // Iterate over the saved watchlist and generate HTML content for each movie. The loop creates a new div element for each movie, sets its inner HTML to include the movie's title, year, poster image, and a "Remove from Watchlist" button, and appends it to the watchlist container.
  savedWatchlist.forEach((movie) => {
    const watchlistCard = document.createElement('div');
    watchlistCard.classList.add('movie-card');

    watchlistCard.innerHTML = `
      <img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <button class="btn btn-remove" onclick='removeFromWatchlist("${movie.imdbID}")'>Remove from Watchlist</button>
      </div>
    `;

    watchlistContainer.appendChild(watchlistCard);
  });
};

// Function to synchronize the watchlist by saving it to localStorage and re-rendering it on the page. This function is called whenever a movie is added or removed from the watchlist to ensure that the displayed watchlist is up-to-date.
const syncWatchlist = () => {
  saveWatchlist(savedWatchlist); // Save the updated watchlist to localStorage
  renderWatchlist(); // Re-render the watchlist on the page to reflect the changes
};

renderWatchlist(); // Initial rendering of the watchlist when the page loads, ensuring that any previously saved movies in the watchlist are displayed to the user.

// Function to remove a movie from the watchlist. It takes the IMDb ID of the movie as input, filters out the movie from the saved watchlist, updates the localStorage, and re-renders the watchlist on the page.
const removeFromWatchlist = (movieID) => {
  if (watchlist.has(movieID)) {
    watchlist.delete(movieID); // Remove the movie's IMDb ID from the watchlist Set
    const updatedWatchlist = savedWatchlist.filter((movie) => movie.imdbID !== movieID); // Filter out the removed movie from the saved watchlist array
    savedWatchlist.length = 0;
    updatedWatchlist.forEach((movie) => savedWatchlist.push(movie));
    syncWatchlist(); // Re-render the watchlist on the page to reflect the changes
  }
};

// Function to fetch movies from the OMBd API based on the search query. The function uses async/await syntax to handle the asynchronous fetch request. It constructs the API URL using the provided query and makes a GET request to the OMBd API. The response is then converted to JSON format and returned. If there is an error during the fetch process, it logs the error to the console.
const fetchMovies = async (query) => {
  const apiKey = '260c692b'; // Replace the {apiKey} in the URL with the actual OMBd API key, allowing the API to authenticate the request and return the relevant movie data based on the search query.
  const url = `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`; // Construct the API URL with the search query and API key. The 's' parameter is used to search for movies by title, and the 'apikey' parameter is used to authenticate the request with the OMBd API.

  const response = await fetch(url); // Sends the request to the API, waits for the fetch request to complete, and stores the response
  const data = await response.json(); // Converts the response to JSON format and waits for it to complete
  console.log(data); // Logs the data to the console for debugging purposes

  // Check if the response contains movies
  if (data.Response === 'True') {
    displayMovies(data.Search); // If movies are found, call the displayMovies function to render them on the page
  } else {
    movieResults.innerHTML = `<p>No movies found for "${query}". Please try a different search term.</p>`; // If no movies are found, display a message to the user
  }


};

// Function to add a movie to the watchlist. 
const addToWatchlist = (movie) => {
  if (!watchlist.has(movie.imdbID)) { // Check if the movie is not already in the watchlist before adding it. This prevents duplicates in the watchlist.
    watchlist.add(movie.imdbID); // Add the movie's IMDb ID to the watchlist Set, ensuring that each movie is unique
    savedWatchlist.push(movie); // Add the movie object to the saved watchlist array, allowing it to be displayed in the watchlist section
    syncWatchlist(); // Call the syncWatchlist function to save the updated watchlist to localStorage and re-render it on the page
  }
};

// Function to display the fetched movies on the page. Called if movies are found.
// It takes an array of movie objects as input and generates HTML content for each movie, including the title, year, and poster image. The generated HTML is then inserted into the movie results container.
const displayMovies = (movies) => {
  movieResults.innerHTML = ''; // Clear any previous movie results

  // Uses a "forEach" loop to iterate over the array of movie objects and generate HTML content for each movie. The loop creates a new div element for each movie, sets its inner HTML to include the movie's title, year, and poster image, and appends it to the movie results container.
  movies.forEach((movie) => {
    const movieCard = document.createElement('div'); // Create a new div element for the movie card
    movieCard.classList.add('movie-card'); // Add a CSS class to the movie card for styling

    // Set the inner HTML of the movie card to include the poster, title, and year
    movieCard.innerHTML = `
    <img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">
    <div class="movie-info">
      <h3 class="movie-title">${movie.Title}</h3>
      <p class="movie-year">${movie.Year}</p>
      <button class="btn" onclick='addToWatchlist(${JSON.stringify(movie)})'>Add to Watchlist</button>
    </div>
    `; 

    movieResults.appendChild(movieCard); // Append the movie card to the movie results container
  });
};

// Event listener for the search form submission. It prevents the default form submission behavior, retrieves the search query from the input field, and calls the fetchMovies function with the query.
searchForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  const query = document.getElementById('movie-search').value.trim(); // Get the search query from the input field and trim any whitespace
  if (query) { // Check if the query is not empty
    fetchMovies(query); // Call the fetchMovies function with the search query
  }
});
