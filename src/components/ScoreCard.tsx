import { calculateScore } from '../utils/scoring'

interface Props {
  nodes: number
  longestStreak: number
  timeSurvived: number
  score: number
}

export default function ScoreCard({ nodes, longestStreak, timeSurvived, score }: Props) {
  const breakdown = calculateScore(nodes, longestStreak, timeSurvived)
  return (
    <div className="bg-neutral-900/90 border border-red-900/50 rounded-xl p-6 w-full max-w-sm shadow-lg shadow-red-900/10 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white mb-4 text-center">Score</h2>
      <div className="space-y-3">
        <Row label="Correct Guesses" value={score / 20} points={score} />
        <Row label="Nodes Discovered" value={nodes} points={breakdown.nodes} />
        <Row label="Longest Streak" value={longestStreak} points={breakdown.streak} />
        <Row label="Time Survived" value={`${timeSurvived}s`} points={breakdown.time} />
        <div className="border-t border-red-900/50 pt-3 mt-3">
          <div className="flex justify-between text-red-400 font-bold text-lg">
            <span>Total</span>
            <span>{(score + breakdown.total).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, points }: { label: string; value: number | string; points: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="text-white font-medium">{value} <span className="text-neutral-500">(+{points})</span></span>
    </div>
  )
}
