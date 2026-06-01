interface Props {
  streakTimeLeft: number
  multiplier: number
  streak: number
}

const TOTAL = 10

const colors = [
  'bg-red-300',
  'bg-red-400',
  'bg-red-500',
  'bg-red-600',
  'bg-red-700',
  'bg-red-800',
]

const textColors = [
  'text-red-300',
  'text-red-400',
  'text-red-500',
  'text-red-600',
  'text-red-700',
  'text-red-800',
]

export default function StreakBar({ streakTimeLeft, multiplier, streak }: Props) {
  if (streakTimeLeft <= 0) return null

  const pct = (streakTimeLeft / TOTAL) * 100
  const idx = Math.min(streak, colors.length - 1)

  return (
    <div className="w-full fixed top-10 left-0 z-40 flex flex-col items-center pointer-events-none">
      <div className="w-80 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${colors[idx]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold mt-0.5 ${textColors[idx]}`}>
        {multiplier.toFixed(2)}x · {streakTimeLeft}s
      </span>
    </div>
  )
}
