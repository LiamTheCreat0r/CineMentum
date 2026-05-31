import { useState, useRef, useEffect } from 'react'
import AutocompleteDropdown from './AutocompleteDropdown'
import { useSearch } from '../hooks/useTMDB'
import type { TMDBMultiResult } from '../types'

interface Props {
  onGuess: (result: TMDBMultiResult) => Promise<boolean>
  includeMovies: boolean
  includeTv: boolean
  guessedIds: Set<number>
}

export default function InputBar({ onGuess, includeMovies, includeTv, guessedIds }: Props) {
  const { query, setQuery, results, loading } = useSearch(includeMovies, includeTv)
  const filtered = results.filter(r => !guessedIds.has(r.id))
  const [shaking, setShaking] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef(results)
  const selectedRef = useRef(selectedIndex)
  const pendingRef = useRef(pending)
  const onGuessRef = useRef(onGuess)

  resultsRef.current = filtered
  selectedRef.current = selectedIndex
  pendingRef.current = pending
  onGuessRef.current = onGuess

  async function handleSelect(result: TMDBMultiResult) {
    setPending(true)
    setQuery('')
    setSelectedIndex(-1)
    const ok = await onGuess(result)
    setPending(false)
    if (!ok) {
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  useEffect(() => {
    const el = inputRef.current
    if (!el) return

    async function onKeyDown(e: KeyboardEvent) {
      const r = resultsRef.current
      const idx = selectedRef.current

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < r.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === 'Enter' && idx >= 0 && r[idx]) {
        e.preventDefault()
        setPending(true)
        setQuery('')
        setSelectedIndex(-1)
        const ok = await onGuessRef.current(r[idx])
        setPending(false)
        if (!ok) {
          setShaking(true)
          setTimeout(() => setShaking(false), 500)
        }
      } else if (e.key === 'Escape') {
        setQuery('')
        inputRef.current?.blur()
      }
    }

    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="relative w-full max-w-lg">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setSelectedIndex(-1) }}
        placeholder={`Search for ${includeMovies && includeTv ? 'a film, TV show' : includeTv ? 'a TV show' : 'a film'} or actor…`}
        disabled={pending}
        spellCheck={false}
        className={`w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 outline-none focus:border-red-500/60 focus:shadow-[0_0_12px_-4px_#dc2626] transition-all ${
          shaking ? 'animate-shake border-red-500' : ''
        }`}
      />
      <AutocompleteDropdown
        results={filtered}
        loading={loading}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        onHoverIndex={setSelectedIndex}
      />
    </div>
  )
}
