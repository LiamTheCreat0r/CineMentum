import { useState, useEffect, useRef } from 'react'
import { searchMulti, getTopMovies, getTopTv } from '../services/tmdbApi'
import { getCached, setCache } from './useCache'
import type { ContentMode } from '../components/SettingsPanel'
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

interface TopItem {
  id: number
  title: string
  poster_path: string | null
  popularity: number
  mediaType: 'movie' | 'tv'
}

async function fetchAllTopMovies(): Promise<TopItem[]> {
  const pages = 5
  const all: TopItem[] = []
  for (let p = 1; p <= pages; p++) {
    const cacheKey = `top:page${p}`
    let page = getCached<TopItem[]>(cacheKey)
    if (!page) {
      const raw = await getTopMovies(p)
      page = raw.map(r => ({ id: r.id, title: r.title, poster_path: r.poster_path, popularity: r.popularity, mediaType: 'movie' as const }))
      setCache(cacheKey, page)
    }
    all.push(...page)
  }
  return all
}

async function fetchAllTopTv(): Promise<TopItem[]> {
  const pages = 5
  const all: TopItem[] = []
  for (let p = 1; p <= pages; p++) {
    const cacheKey = `tv:top:page${p}`
    let page = getCached<TopItem[]>(cacheKey)
    if (!page) {
      const raw = await getTopTv(p)
      page = raw.map(r => ({ id: r.id, title: r.name, poster_path: r.poster_path, popularity: r.popularity, mediaType: 'tv' as const }))
      setCache(cacheKey, page)
    }
    all.push(...page)
  }
  return all
}

async function fetchCombinedTop(): Promise<TopItem[]> {
  const [movies, tvShows] = await Promise.all([fetchAllTopMovies(), fetchAllTopTv()])
  const combined = [...movies, ...tvShows]
  combined.sort((a, b) => b.popularity - a.popularity)
  return combined.slice(0, POPULAR_FETCH_COUNT)
}

export async function fetchRandomStarter(mode: ContentMode): Promise<{ id: number; title: string; poster_path: string | null; mediaType: 'movie' | 'tv' }> {
  let pool: TopItem[]

  if (mode === 'both') {
    pool = await fetchCombinedTop()
  } else if (mode === 'tv') {
    const cacheKey = 'tv:top:all'
    let cached = getCached<TopItem[]>(cacheKey)
    if (!cached) {
      cached = await fetchAllTopTv()
      setCache(cacheKey, cached)
    }
    pool = cached.slice(0, POPULAR_FETCH_COUNT)
  } else {
    const cacheKey = 'top:all'
    let cached = getCached<TopItem[]>(cacheKey)
    if (!cached) {
      cached = await fetchAllTopMovies()
      setCache(cacheKey, cached)
    }
    pool = cached.slice(0, POPULAR_FETCH_COUNT)
  }

  const pick = pool[Math.floor(Math.random() * pool.length)]
  return { id: pick.id, title: pick.title, poster_path: pick.poster_path, mediaType: pick.mediaType }
}
