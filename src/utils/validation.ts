import { getMovieCredits, getTvAggregateCredits, getPersonCombinedCredits } from '../services/tmdbApi'
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
      const mediaCredit = credit as CreditMovie | CreditTv
      if (mediaCredit.mediaType === 'movie') {
        const key = `search:${mediaCredit.title.toLowerCase().trim()}`
        if (!getCached<TMDBMultiResult[]>(key)) {
          setCache(key, [{
            id: mediaCredit.id,
            media_type: 'movie',
            title: mediaCredit.title,
            name: undefined,
            poster_path: mediaCredit.poster_path,
            profile_path: null,
            popularity: mediaCredit.popularity,
          }])
        }
      } else {
        const key = `search:${mediaCredit.name.toLowerCase().trim()}`
        if (!getCached<TMDBMultiResult[]>(key)) {
          setCache(key, [{
            id: mediaCredit.id,
            media_type: 'tv',
            title: undefined,
            name: mediaCredit.name,
            poster_path: mediaCredit.poster_path,
            profile_path: null,
            popularity: mediaCredit.popularity,
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
    const connections: GraphNode[] = []

    for (const tvNode of tvNodes) {
      const credits = await fetchOrWait<CreditPerson[]>(`tv:${tvNode.tmdbId}:credits:v2`, async () => {
        const raw = await getTvAggregateCredits(tvNode.tmdbId)
        precacheCreditSearchResults(raw, 'tv')
        return raw
      })
      if (credits.some(c => c.id === candidate.tmdbId)) {
        connections.push(tvNode)
      }
    }

    for (const filmNode of filmNodes) {
      const credits = await fetchOrWait<CreditPerson[]>(`movie:${filmNode.tmdbId}:credits`, async () => {
        const raw = await getMovieCredits(filmNode.tmdbId)
        precacheCreditSearchResults(raw, 'film')
        return raw
      })
      if (credits.some(c => c.id === candidate.tmdbId)) {
        connections.push(filmNode)
      }
    }

    return connections
  } else {
    const creditFn = candidate.type === 'tv' ? getTvAggregateCredits : getMovieCredits
    const cacheKey = candidate.type === 'tv' ? `tv:${candidate.tmdbId}:credits:v2` : `movie:${candidate.tmdbId}:credits`
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
    const cacheKey = `tv:${node.tmdbId}:credits:v2`
    await fetchOrWait<CreditPerson[]>(cacheKey, async () => {
      const raw = await getTvAggregateCredits(node.tmdbId)
      precacheCreditSearchResults(raw, 'tv')
      return raw
    })
  } else {
    const cacheKey = `person:${node.tmdbId}:combined_credits:v3`
    await fetchOrWait<(CreditMovie | CreditTv)[]>(cacheKey, async () => {
      const raw = await getPersonCombinedCredits(node.tmdbId)
      const mapped = raw.map(c => {
        if (c.media_type === 'movie') {
          return { id: c.id, mediaType: 'movie' as const, title: c.title ?? '', poster_path: c.poster_path, popularity: c.popularity } as CreditMovie
        }
        return { id: c.id, mediaType: 'tv' as const, name: c.name ?? '', poster_path: c.poster_path, popularity: c.popularity } as CreditTv
      })
      precacheCreditSearchResults(mapped as CreditMovie[] | CreditTv[], 'actor')
      return mapped
    })
  }
}
