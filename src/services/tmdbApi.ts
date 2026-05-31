const BASE = 'https://api.themoviedb.org/3'

function apiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key) throw new Error('VITE_TMDB_API_KEY not set')
  return key
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export async function searchMulti(query: string, includeMovies = true, includeTv = false) {
  const url = `${BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${apiKey()}&language=en-US&page=1`
  const data = await fetchJSON<{ results: { id: number; media_type: string; title?: string; name?: string; poster_path?: string | null; profile_path?: string | null; genre_ids?: number[]; original_language?: string }[] }>(url)
  return data.results.filter(r => {
    const matchesType =
      (includeMovies && r.media_type === 'movie') ||
      r.media_type === 'person' ||
      (includeTv && r.media_type === 'tv')
    if (!matchesType) return false
    const isAnime = r.genre_ids?.includes(16) && r.original_language === 'ja'
    return !isAnime
  })
}

export async function getMovieCredits(movieId: number) {
  const url = `${BASE}/movie/${movieId}/credits?api_key=${apiKey()}&language=en-US`
  const data = await fetchJSON<{ cast: { id: number; name: string; profile_path: string | null; popularity: number }[] }>(url)
  return data.cast
}

export async function getPopularMovies(page = 1) {
  const url = `${BASE}/movie/popular?api_key=${apiKey()}&language=en-US&page=${page}`
  const data = await fetchJSON<{ results: { id: number; title: string; poster_path: string | null }[] }>(url)
  return data.results
}

export async function getTopMovies(page = 1) {
  const url = `${BASE}/discover/movie?sort_by=vote_count.desc&api_key=${apiKey()}&language=en-US&page=${page}`
  const data = await fetchJSON<{ results: { id: number; title: string; poster_path: string | null; genre_ids?: number[]; original_language?: string; popularity: number }[] }>(url)
  return data.results.filter(r => !(r.genre_ids?.includes(16) && r.original_language === 'ja'))
}

export async function getTvAggregateCredits(tvId: number) {
  const url = `${BASE}/tv/${tvId}/aggregate_credits?api_key=${apiKey()}&language=en-US`
  const data = await fetchJSON<{ cast: { id: number; name: string; profile_path: string | null; popularity: number }[] }>(url)
  return data.cast
}

export async function getPersonCombinedCredits(personId: number) {
  const url = `${BASE}/person/${personId}/combined_credits?api_key=${apiKey()}&language=en-US`
  const data = await fetchJSON<{
    cast: { id: number; media_type: 'movie' | 'tv'; title?: string; name?: string; poster_path: string | null; popularity: number }[]
  }>(url)
  return data.cast
}

export async function getTopTv(page = 1) {
  const url = `${BASE}/discover/tv?sort_by=vote_count.desc&api_key=${apiKey()}&language=en-US&page=${page}`
  const data = await fetchJSON<{ results: { id: number; name: string; poster_path: string | null; genre_ids?: number[]; original_language?: string; popularity: number }[] }>(url)
  return data.results.filter(r => !(r.genre_ids?.includes(16) && r.original_language === 'ja'))
}
