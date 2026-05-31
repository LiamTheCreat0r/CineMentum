import { useState, useEffect, useRef } from 'react'
import TimerBar from './TimerBar'
import StreakBar from './StreakBar'
import GraphMap from './GraphMap'
import InputBar from './InputBar'
import { useTimer } from '../hooks/useTimer'
import { fetchRandomStarter } from '../hooks/useTMDB'
import { validateGuess, preloadNodeCredits } from '../utils/validation'
import type { Settings } from './SettingsPanel'
import type { GraphNode, GraphEdge, TMDBMultiResult, NodeType } from '../types'

const GUESS_POINTS = 20

interface Props {
  settings: Settings
  onEnd: (nodes: GraphNode[], edges: GraphEdge[], longestStreak: number, timeSurvived: number, score: number) => void
}

export default function Game({ settings, onEnd }: Props) {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [longestStreak, setLongestStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [ready, setReady] = useState(false)
  const { timeLeft, isExpired, start, addTime } = useTimer()
  const [streakTimeLeft, setStreakTimeLeft] = useState(0)
  const streakRef = useRef(0)
  const multiplier = 1 + 0.25 * streakRef.current
  const timerStarted = useRef(false)
  const ended = useRef(false)
  const startTimeRef = useRef(0)
  const streakTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const includeMovies = settings.contentMode !== 'tv'
  const includeTv = settings.contentMode !== 'movies'

  useEffect(() => {
    const pickTv = settings.contentMode === 'tv' || (settings.contentMode === 'both' && Math.random() > 0.5)
    fetchRandomStarter(pickTv).then(item => {
      const type = pickTv ? 'tv' : 'film'
      const starter: GraphNode = {
        id: `${type}-${item.id}`,
        type,
        label: item.title,
        tmdbId: item.id,
        posterPath: item.poster_path,
        profilePath: null,
      }
      setNodes([starter])
      preloadNodeCredits(starter)
      startTimeRef.current = Date.now()
      setReady(true)
    })
  }, [settings.contentMode])

  useEffect(() => {
    if (ready && !timerStarted.current) {
      timerStarted.current = true
      start()
    }
  }, [ready, start])

  useEffect(() => {
    if (isExpired && !ended.current) {
      ended.current = true
      const timeSurvived = Math.round((Date.now() - startTimeRef.current) / 1000)
      onEnd(nodes, edges, longestStreak, timeSurvived, score)
    }
  }, [isExpired, nodes, edges, longestStreak, score, onEnd])

  function startStreakTimer() {
    clearInterval(streakTimerRef.current)
    setStreakTimeLeft(10)
    streakTimerRef.current = setInterval(() => {
      setStreakTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(streakTimerRef.current)
          setStreakTimeLeft(0)
          streakRef.current = 0
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function resetStreak() {
    streakRef.current = 0
    clearInterval(streakTimerRef.current)
    setStreakTimeLeft(0)
  }

  useEffect(() => {
    return () => clearInterval(streakTimerRef.current)
  }, [])

  const filmNodes = nodes.filter(n => n.type === 'film')
  const actorNodes = nodes.filter(n => n.type === 'actor')
  const tvNodes = nodes.filter(n => n.type === 'tv')

  async function handleGuess(result: TMDBMultiResult): Promise<boolean> {
    const typeMap: Record<string, NodeType> = { movie: 'film', person: 'actor', tv: 'tv' }
    const nodeType = typeMap[result.media_type] || 'film'
    const candidate: GraphNode = {
      id: `${result.media_type}-${result.id}`,
      type: nodeType,
      label: result.media_type === 'movie' ? result.title! : result.media_type === 'tv' ? result.name! : result.name!,
      tmdbId: result.id,
      posterPath: result.media_type === 'movie' || result.media_type === 'tv' ? result.poster_path! : null,
      profilePath: result.media_type === 'person' ? result.profile_path! : null,
    }
    if (nodes.some(n => n.tmdbId === candidate.tmdbId)) {
      resetStreak()
      return false
    }
    const connectedTo = await validateGuess(candidate, filmNodes, actorNodes, tvNodes)
    if (connectedTo.length === 0) {
      resetStreak()
      return false
    }
    setNodes(prev => [...prev, candidate])
    preloadNodeCredits(candidate)
    const newEdges: GraphEdge[] = connectedTo.map(ct => ({
      source: ct.id,
      target: candidate.id,
    }))
    setEdges(prev => [...prev, ...newEdges])
    streakRef.current += 1
    setLongestStreak(l => Math.max(l, streakRef.current))
    const currentMultiplier = 1 + 0.25 * streakRef.current
    setScore(prev => prev + Math.round(GUESS_POINTS * currentMultiplier))
    addTime(candidate.type)
    startStreakTimer()
    return true
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-950 text-white">
        Loading…
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-neutral-950 flex flex-col">
      <TimerBar timeLeft={timeLeft} />
      <StreakBar streakTimeLeft={streakTimeLeft} multiplier={multiplier} streak={streakRef.current} />
      <div className="absolute top-3 right-4 z-50">
        <span className="text-white font-bold text-lg">
          {score}
          {streakTimeLeft > 0 && (
            <span className="text-cyan-400 text-sm ml-1">
              ({multiplier.toFixed(2)}x)
            </span>
          )}
        </span>
      </div>
      <div className="flex-1 relative">
        <GraphMap nodes={nodes} edges={edges} />
      </div>
      <div className="flex justify-center pb-6 pt-2">
        <InputBar onGuess={handleGuess} includeMovies={includeMovies} includeTv={includeTv} />
      </div>
    </div>
  )
}
