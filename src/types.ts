export type NodeType = 'film' | 'actor' | 'tv'

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  tmdbId: number
  posterPath: string | null
  profilePath: string | null
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  source: string
  target: string
}

export type GamePhase = 'start' | 'playing' | 'over'

export interface GameState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  phase: GamePhase
  streak: number
  longestStreak: number
  startTime: number
  endTime: number | null
}

export interface TMDBMultiResult {
  id: number
  media_type: 'movie' | 'person' | 'tv'
  title?: string
  name?: string
  poster_path?: string | null
  profile_path?: string | null
  popularity: number
}

export interface CreditTv {
  id: number
  mediaType: 'tv'
  name: string
  poster_path: string | null
  popularity: number
}

export interface CreditMovie {
  id: number
  mediaType: 'movie'
  title: string
  poster_path: string | null
  popularity: number
}

export interface CreditPerson {
  id: number
  name: string
  profile_path: string | null
  popularity: number
}

export interface TMDBMovieCredit {
  id: number
  cast: CreditPerson[]
}

export interface TMDBTvCredit {
  id: number
  cast: CreditPerson[]
}


