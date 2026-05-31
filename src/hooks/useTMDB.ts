import { useState, useEffect, useRef } from 'react'
import { searchMulti, getTopMovies, getTopTv } from '../services/tmdbApi'
import { getCached, setCache } from './useCache'
import type { TMDBMultiResult } from '../types'
import { POPULAR_FETCH_COUNT } from '../constants'

export function useSearch(includeMovies = true, includeTv = false) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBMultiResult[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }

    const mode = `${includeMovies ? 'm' : ''}${includeTv ? 't' : ''}`
    const cacheKey = `search:${mode}:${trimmed.toLowerCase()}`
    const cached = getCached<TMDBMultiResult[]>(cacheKey)

    if (cached) {
      setResults(cached)
    }

    setLoading(!cached)
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const data = await searchMulti(trimmed, includeMovies, includeTv)
        const mapped = data.map(d => ({
          id: d.id,
          media_type: d.media_type as 'movie' | 'person' | 'tv',
          title: d.title,
          name: d.name,
          poster_path: d.poster_path ?? null,
          profile_path: d.profile_path ?? null,
          popularity: (d as any).popularity ?? 0,
        }))
        mapped.sort((a, b) => b.popularity - a.popularity)
        setCache(cacheKey, mapped)
        setResults(mapped)
      } catch {
        if (!cached) setResults([])
      }
      setLoading(false)
    }, 300)
  }, [query, includeMovies, includeTv])

  return { query, setQuery, results, loading }
}

async function fetchAllTopMovies(): Promise<{ id: number; title: string; poster_path: string | null }[]> {
  const pages = 5
  const all: { id: number; title: string; poster_path: string | null }[] = []
  for (let p = 1; p <= pages; p++) {
    const cacheKey = `top:page${p}`
    let page = getCached<{ id: number; title: string; poster_path: string | null }[]>(cacheKey)
    if (!page) {
      page = await getTopMovies(p)
      setCache(cacheKey, page)
    }
    all.push(...page)
  }
  return all
}

async function fetchAllTopTv(): Promise<{ id: number; name: string; poster_path: string | null }[]> {
  const pages = 5
  const all: { id: number; name: string; poster_path: string | null }[] = []
  for (let p = 1; p <= pages; p++) {
    const cacheKey = `tv:top:page${p}`
    let page = getCached<{ id: number; name: string; poster_path: string | null }[]>(cacheKey)
    if (!page) {
      page = await getTopTv(p)
      setCache(cacheKey, page)
    }
    all.push(...page)
  }
  return all
}

export async function fetchRandomStarter(includeTv = false): Promise<{ id: number; title: string; poster_path: string | null }> {
  if (includeTv) {
    const tvCacheKey = 'tv:top:all'
    let tvShows = getCached<{ id: number; name: string; poster_path: string | null }[]>(tvCacheKey)
    if (!tvShows) {
      tvShows = await fetchAllTopTv()
      setCache(tvCacheKey, tvShows)
    }
    const pool = tvShows.slice(0, POPULAR_FETCH_COUNT)
    const pick = pool[Math.floor(Math.random() * pool.length)]
    return { id: pick.id, title: pick.name, poster_path: pick.poster_path }
  }

  const cacheKey = 'top:all'
  let movies = getCached<{ id: number; title: string; poster_path: string | null }[]>(cacheKey)
  if (!movies) {
    movies = await fetchAllTopMovies()
    setCache(cacheKey, movies)
  }
  const pool = movies.slice(0, POPULAR_FETCH_COUNT)
  return pool[Math.floor(Math.random() * pool.length)]
}
