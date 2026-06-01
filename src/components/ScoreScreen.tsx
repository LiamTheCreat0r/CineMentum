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
  onMainMenu: () => void
}

export default function ScoreScreen({ nodes, edges, longestStreak, timeSurvived, score, onRestart, onMainMenu }: Props) {
  return (
    <div className="relative w-full h-full bg-[radial-gradient(ellipse_at_center,_#1a0505_0%,_#0a0a0a_60%,_#000_100%)]">
      <div className="absolute inset-0">
        <GraphMap nodes={nodes} edges={edges} />
      </div>
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center gap-4 pt-6 pointer-events-none z-10">
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
          className="pointer-events-auto px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 hover:scale-105 transition-all text-base shadow-lg shadow-red-600/20"
        >
          Play Again
        </button>
        <button
          onClick={onMainMenu}
          className="pointer-events-auto px-6 py-2 bg-neutral-800/80 text-neutral-300 font-semibold rounded-lg hover:bg-neutral-700 hover:text-white hover:scale-105 transition-all text-base border border-neutral-700"
        >
          Main Menu
        </button>
      </div>
    </div>
  )
}
