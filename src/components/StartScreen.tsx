import { useMemo } from 'react'
import SettingsPanel from './SettingsPanel'
import GraphMap from './GraphMap'
import type { Settings } from './SettingsPanel'
import type { GraphNode, GraphEdge } from '../types'

interface Props {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
  onStart: () => void
}

const sampleNodes: GraphNode[] = [
  { id: 'film-1', type: 'film', label: 'Inception', tmdbId: 27205, posterPath: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg', profilePath: null },
  { id: 'person-1', type: 'actor', label: 'Leonardo DiCaprio', tmdbId: 6193, posterPath: null, profilePath: '/mkdRcVIQl4WZhDf1vXKWTD7HZrZ.jpg' },
  { id: 'film-2', type: 'film', label: 'The Dark Knight', tmdbId: 155, posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', profilePath: null },
  { id: 'person-2', type: 'actor', label: 'Christian Bale', tmdbId: 3894, posterPath: null, profilePath: '/7Pxez9J8fuPd2Mn9kex13YALrCQ.jpg' },
  { id: 'film-3', type: 'film', label: 'Interstellar', tmdbId: 157336, posterPath: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg', profilePath: null },
  { id: 'person-3', type: 'actor', label: 'Matthew McConaughey', tmdbId: 5081, posterPath: null, profilePath: '/5nCSG5TL1bP1geD8aaBfaLnLLCD.jpg' },
  { id: 'tv-1', type: 'tv', label: 'True Detective', tmdbId: 46648, posterPath: '/zYqVTiHK5ZajYcNzAW7qWte5NWS.jpg', profilePath: null },
  { id: 'film-4', type: 'film', label: 'Pulp Fiction', tmdbId: 680, posterPath: '/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', profilePath: null },
  { id: 'person-4', type: 'actor', label: 'Samuel L. Jackson', tmdbId: 2231, posterPath: null, profilePath: '/aF7jIjZ66M0af5c02P9Duzq1zO7.jpg' },
  { id: 'film-5', type: 'film', label: 'Django Unchained', tmdbId: 68718, posterPath: '/mhf63wOnaLCnzxeHgngTH98WaVh.jpg', profilePath: null },
  { id: 'person-5', type: 'actor', label: 'Jamie Foxx', tmdbId: 190, posterPath: null, profilePath: '/tphaDw3WOWetygIxMl5VtBtp5Xh.jpg' },
  { id: 'film-6', type: 'film', label: 'The Matrix', tmdbId: 603, posterPath: '/aOIuZAjPaRIE6CMzbazvcHuHXDc.jpg', profilePath: null },
  { id: 'person-6', type: 'actor', label: 'Keanu Reeves', tmdbId: 6384, posterPath: null, profilePath: '/kEoUZKEG7dzbCESDjd0CKAN1r0n.jpg' },
  { id: 'film-7', type: 'film', label: 'John Wick', tmdbId: 245891, posterPath: '/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg', profilePath: null },
  { id: 'person-7', type: 'actor', label: 'Carrie-Anne Moss', tmdbId: 1203, posterPath: null, profilePath: '/tb0SgiSuBNfrtU6BZ6CEUHs0GJT.jpg' },
  { id: 'tv-2', type: 'tv', label: 'Stranger Things', tmdbId: 66732, posterPath: '/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg', profilePath: null },
  { id: 'person-8', type: 'actor', label: 'Millie Bobby Brown', tmdbId: 1312597, posterPath: null, profilePath: '/gFtMsePTX7xHqeSsX28MsX52YJc.jpg' },
  { id: 'film-8', type: 'film', label: 'Godzilla: King of the Monsters', tmdbId: 373571, posterPath: '/mzOHg7Q5q9yUmY0b9Esu8Qe6Nnm.jpg', profilePath: null },
]

const sampleEdges: GraphEdge[] = [
  { source: 'person-1', target: 'film-1' },
  { source: 'person-1', target: 'film-2' },
  { source: 'person-2', target: 'film-2' },
  { source: 'person-2', target: 'film-3' },
  { source: 'person-3', target: 'film-3' },
  { source: 'person-3', target: 'tv-1' },
  { source: 'person-4', target: 'film-4' },
  { source: 'person-4', target: 'film-5' },
  { source: 'person-5', target: 'film-5' },
  { source: 'person-6', target: 'film-6' },
  { source: 'person-6', target: 'film-7' },
  { source: 'person-7', target: 'film-6' },
  { source: 'person-7', target: 'film-7' },
  { source: 'person-8', target: 'tv-2' },
  { source: 'person-8', target: 'film-8' },
  { source: 'person-1', target: 'film-4' },
  { source: 'person-4', target: 'film-1' },
]

export default function StartScreen({ settings, onSettingsChange, onStart }: Props) {
  const nodes = useMemo(() => sampleNodes, [])
  const edges = useMemo(() => sampleEdges, [])

  return (
    <div className="relative flex flex-col items-center justify-center h-full text-white gap-6 bg-[radial-gradient(ellipse_at_center,_#1a0505_0%,_#0a0a0a_60%,_#000_100%)] overflow-hidden">
      <div className="absolute inset-0 blur-sm opacity-25 pointer-events-none scale-125 animate-drift">
        <GraphMap nodes={nodes} edges={edges} frozen />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <h1 className="text-5xl font-bold tracking-tight">CINE<span className="text-red-600 animate-glow">MENTUM</span></h1>
        <div className="w-24 h-0.5 bg-red-600/60 rounded-full" />
        <p className="text-neutral-400 text-lg max-w-md text-center leading-relaxed">
          Build a film knowledge graph under time pressure.<br />
          Name actors and films connected to anything on your map.
        </p>
        <button
          onClick={onStart}
          className="mt-4 px-10 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-lg shadow-lg shadow-red-600/20"
        >
          Start
        </button>
        <SettingsPanel settings={settings} onChange={onSettingsChange} />
      </div>
    </div>
  )
}
