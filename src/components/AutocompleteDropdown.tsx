import { TMDB_IMAGE_BASE } from '../constants'
import type { TMDBMultiResult } from '../types'

interface Props {
  results: TMDBMultiResult[]
  loading: boolean
  selectedIndex: number
  onSelect: (result: TMDBMultiResult) => void
  onHoverIndex: (index: number) => void
}

export default function AutocompleteDropdown({ results, loading, selectedIndex, onSelect, onHoverIndex }: Props) {
  if (results.length === 0 && !loading) return null
  return (
    <ul className="absolute bottom-full left-0 right-0 mb-1 bg-neutral-800 border border-neutral-700 rounded-lg max-h-64 overflow-y-auto z-50 shadow-xl select-none">
      {loading && (
        <li className="px-4 py-2 text-neutral-400 text-sm cursor-default">Searching…</li>
      )}
      {results.map((r, i) => (
        <li
          key={`${r.media_type}-${r.id}`}
          onMouseDown={e => { e.preventDefault(); onSelect(r) }}
          onMouseEnter={() => onHoverIndex(i)}
          className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
            i === selectedIndex ? 'bg-neutral-700' : 'hover:bg-neutral-700'
          }`}
        >
          <img
            src={
              r.media_type === 'movie'
                ? (r.poster_path ? `${TMDB_IMAGE_BASE}${r.poster_path}` : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect fill="%23333" width="100" height="150"/><text fill="%23666" x="50" y="75" text-anchor="middle" font-size="12">No Poster</text></svg>')
                : (r.profile_path ? `${TMDB_IMAGE_BASE}${r.profile_path}` : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150"><rect fill="%23333" width="100" height="150"/><text fill="%23666" x="50" y="75" text-anchor="middle" font-size="12">No Photo</text></svg>')
            }
            alt=""
            className="w-8 h-12 object-cover rounded flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-white text-sm truncate block">
              {r.media_type === 'movie' ? r.title : r.name}
            </span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            r.media_type === 'movie'
              ? 'bg-blue-600 text-blue-100'
              : 'bg-green-600 text-green-100'
          }`}>
            {r.media_type === 'movie' ? 'Film' : 'Actor'}
          </span>
        </li>
      ))}
    </ul>
  )
}
