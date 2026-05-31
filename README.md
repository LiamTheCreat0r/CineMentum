# CineMentum

A film & TV knowledge graph game. Guess connections between actors, movies, and TV shows using the TMDB API.

Built with React 19, TypeScript, Vite, D3.js force graph, and Tailwind CSS v4.

## How to play

- A starter movie or TV show appears on the graph
- Type any actor, movie, or TV show into the search bar
- If your guess shares a cast/credit connection with a node already on the graph, it gets added as a new node with an edge drawn between them
- Keep going until time runs out — longer streaks earn multipliers

## Modes

- **Movies only** — starters and guesses are movies
- **TV only** — starters and guesses are TV shows
- **Both** — mix of movies and TV shows on the same graph

## Setup

```bash
npm install
```

Create a `.env` file with your TMDB API key:

```
VITE_TMDB_API_KEY=your_key_here
```

Get a key at https://www.themoviedb.org/settings/api

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Tech stack

- React 19 with hooks
- TypeScript
- Vite
- D3.js force-directed graph (`d3-force`)
- TMDB API v3
- Tailwind CSS v4
- localStorage-based caching with 1-hour TTL

## Data source

All data from [TMDB](https://www.themoviedb.org). TV show cast lookups use the `aggregate_credits` endpoint for complete cast across all seasons. Actor credit lookups use `combined_credits` for search precaching. Anime (genre 16 + Japanese language) is filtered from starters and search results. Anime is not the intended use for this project.
