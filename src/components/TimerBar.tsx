import { INITIAL_TIME } from '../constants'

interface Props {
  timeLeft: number
}

export default function TimerBar({ timeLeft }: Props) {
  const pct = Math.min((timeLeft / INITIAL_TIME) * 100, 100)
  const color =
    timeLeft > 20 ? 'bg-green-500' :
    timeLeft > 10 ? 'bg-yellow-500' :
    'bg-red-500 animate-pulse'
  const textColor =
    timeLeft > 20 ? 'text-green-500' :
    timeLeft > 10 ? 'text-yellow-500' :
    'text-red-500'

  return (
    <div className="w-full fixed top-0 left-0 z-50 flex flex-col items-center">
      <div className="w-full bg-neutral-800 h-2">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-bold mt-0.5 ${textColor}`}>
        {timeLeft}s
      </span>
    </div>
  )
}
