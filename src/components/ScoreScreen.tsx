import GraphMap from './GraphMap'
import ScoreCard from './ScoreCard'
import type { GraphNode, GraphEdge } from '../types'

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
  longestStreak: number
  timeSurvived: number
  score: number
  onRestart: () => void
}

export default function ScoreScreen({ nodes, edges, longestStreak, timeSurvived, score, onRestart }: Props) {
  return (
    <div className="relative w-full h-full bg-neutral-950 flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <div className="w-full h-full animate-drift">
          <GraphMap nodes={nodes} edges={edges} frozen />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
        <div className="pointer-events-auto">
          <ScoreCard
            nodes={nodes.length}
            longestStreak={longestStreak}
            timeSurvived={timeSurvived}
            score={score}
          />
        </div>
        <button
          onClick={onRestart}
          className="pointer-events-auto px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors text-base"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
