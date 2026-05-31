import { getMovieCredits, getPersonCredits, getTvCredits, getPersonTvCredits } from '../services/tmdbApi'
import { fetchOrWait, getCached, setCache } from '../hooks/useCache'
import type { GraphNode, CreditPerson, CreditMovie, CreditTv, TMDBMultiResult } from '../types'

const PRECACHE_LIMIT = 20

function precacheCreditSearchResults(
  credits: CreditPerson[] | CreditMovie[] | CreditTv[],
  sourceType: 'film' | 'actor' | 'tv',
): void {
  const max = Math.min(credits.length, PRECACHE_LIMIT)
  for (let i = 0; i < max; i++) {
    const credit = credits[i]
    if (sourceType === 'film' || sourceType === 'tv') {
      const person = credit as CreditPerson
      const key = `search:${person.name.toLowerCase().trim()}`
      if (!getCached<TMDBMultiResult[]>(key)) {
        setCache(key, [{
          id: person.id,
          media_type: 'person',
          name: person.name,
          title: undefined,
          poster_path: null,
          profile_path: person.profile_path,
          popularity: person.popularity,
        }])
      }
    } else if (sourceType === 'actor') {
      if ('title' in credit) {
        const movie = credit as CreditMovie
        const key = `search:${movie.title.toLowerCase().trim()}`
        if (!getCached<TMDBMultiResult[]>(key)) {
          setCache(key, [{
            id: movie.id,
            media_type: 'movie',
            title: movie.title,
            name: undefined,
            poster_path: movie.poster_path,
            profile_path: null,
            popularity: movie.popularity,
          }])
        }
      } else {
        const tv = credit as CreditTv
        const key = `search:${tv.name.toLowerCase().trim()}`
        if (!getCached<TMDBMultiResult[]>(key)) {
          setCache(key, [{
            id: tv.id,
            media_type: 'tv',
            title: undefined,
            name: tv.name,
            poster_path: tv.poster_path,
            profile_path: null,
            popularity: tv.popularity,
          }])
        }
      }
    }
  }
}

export async function validateGuess(
  candidate: GraphNode,
  filmNodes: GraphNode[],
  actorNodes: GraphNode[],
  tvNodes: GraphNode[] = [],
): Promise<GraphNode[]> {
  if (candidate.type === 'actor') {
    const cacheKey = `person:${candidate.tmdbId}:credits`
    const credits = await fetchOrWait<CreditMovie[]>(cacheKey, async () => {
      const raw = await getPersonCredits(candidate.tmdbId)
      precacheCreditSearchResults(raw, 'actor')
      return raw
    })
    const filmConnections = filmNodes.filter(n => new Set(credits.map(c => c.id)).has(n.tmdbId))

    const tvCacheKey = `person:${candidate.tmdbId}:tv_credits`
    const tvCredits = await fetchOrWait<CreditTv[]>(tvCacheKey, async () => {
      const raw = await getPersonTvCredits(candidate.tmdbId)
      precacheCreditSearchResults(raw, 'actor')
      return raw
    })
    const tvConnections = tvNodes.filter(n => new Set(tvCredits.map(c => c.id)).has(n.tmdbId))

    return [...filmConnections, ...tvConnections]
  } else {
    const creditFn = candidate.type === 'tv' ? getTvCredits : getMovieCredits
    const cacheKey = candidate.type === 'tv' ? `tv:${candidate.tmdbId}:credits` : `movie:${candidate.tmdbId}:credits`
    const credits = await fetchOrWait<CreditPerson[]>(cacheKey, async () => {
      const raw = await creditFn(candidate.tmdbId)
      precacheCreditSearchResults(raw, 'film')
      return raw
    })
    const creditSet = new Set(credits.map(c => c.id))
    return actorNodes.filter(n => creditSet.has(n.tmdbId))
  }
}

export async function preloadNodeCredits(node: GraphNode): Promise<void> {
  if (node.type === 'film') {
    const cacheKey = `movie:${node.tmdbId}:credits`
    await fetchOrWait<CreditPerson[]>(cacheKey, async () => {
      const raw = await getMovieCredits(node.tmdbId)
      precacheCreditSearchResults(raw, 'film')
      return raw
    })
  } else if (node.type === 'tv') {
    const cacheKey = `tv:${node.tmdbId}:credits`
    await fetchOrWait<CreditPerson[]>(cacheKey, async () => {
      const raw = await getTvCredits(node.tmdbId)
      precacheCreditSearchResults(raw, 'tv')
      return raw
    })
  } else {
    const cacheKey = `person:${node.tmdbId}:credits`
    await fetchOrWait<CreditMovie[]>(cacheKey, async () => {
      const raw = await getPersonCredits(node.tmdbId)
      precacheCreditSearchResults(raw, 'actor')
      return raw
    })
    const tvCacheKey = `person:${node.tmdbId}:tv_credits`
    await fetchOrWait<CreditTv[]>(tvCacheKey, async () => {
      const raw = await getPersonTvCredits(node.tmdbId)
      precacheCreditSearchResults(raw, 'actor')
      return raw
    })
  }
}
