interface Props {
  streakTimeLeft: number
  multiplier: number
  streak: number
}

const TOTAL = 10

const colors = [
  'bg-orange-300',
  'bg-orange-400',
  'bg-orange-500',
  'bg-orange-600',
  'bg-orange-700',
  'bg-orange-800',
]

const textColors = [
  'text-orange-300',
  'text-orange-400',
  'text-orange-500',
  'text-orange-600',
  'text-orange-700',
  'text-orange-800',
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
