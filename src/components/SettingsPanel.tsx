export type ContentMode = 'movies' | 'tv' | 'both'

export interface Settings {
  contentMode: ContentMode
  streakEnabled: boolean
  baseTime: number
  maxTimeEnabled: boolean
  maxTime: number
}

interface Props {
  settings: Settings
  onChange: (settings: Settings) => void
}

const MODES: { value: ContentMode; label: string }[] = [
  { value: 'movies', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
  { value: 'both', label: 'Both' },
]

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div className="w-full max-w-xs mx-auto bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col gap-3">
      <span className="text-sm text-neutral-300">Settings</span>

      <div className="relative bg-neutral-800 rounded-lg p-1 overflow-hidden">
        <div className="absolute top-1 bottom-1 left-1 right-1 pointer-events-none">
          <div
            className="h-full w-1/3 bg-red-600 rounded-md shadow-sm transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${MODES.findIndex(m => m.value === settings.contentMode) * 100}%)` }}
          />
        </div>
        <div className="relative z-10 flex">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => onChange({ ...settings, contentMode: m.value })}
              className={`flex-1 px-3 py-1.5 text-sm font-medium ${
                settings.contentMode === m.value
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between text-sm text-neutral-300">
        Streak System
        <button onClick={() => onChange({ ...settings, streakEnabled: !settings.streakEnabled })} className={`relative w-10 h-5 rounded-full transition-colors ${settings.streakEnabled ? 'bg-red-600' : 'bg-neutral-700'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.streakEnabled ? 'translate-x-5' : ''}`} />
        </button>
      </label>

      <div className="flex items-center justify-between text-sm text-neutral-300">
        Base Time
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={settings.baseTime}
            onChange={e => onChange({ ...settings, baseTime: Number(e.target.value) })}
            className="w-24 accent-red-600"
          />
          <span className="text-neutral-300 w-8 text-right">{settings.baseTime}s</span>
        </div>
      </div>

      <div className="border-t border-neutral-800 pt-3 flex flex-col gap-3">
        <label className="flex items-center justify-between text-sm text-neutral-300">
          Max Time Mode
          <button onClick={() => onChange({ ...settings, maxTimeEnabled: !settings.maxTimeEnabled })} className={`relative w-10 h-5 rounded-full transition-colors ${settings.maxTimeEnabled ? 'bg-red-600' : 'bg-neutral-700'}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.maxTimeEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </label>

        {settings.maxTimeEnabled && (
          <div className="flex items-center justify-between text-sm text-neutral-300 pl-4">
            Duration
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={30}
                max={300}
                step={10}
                value={settings.maxTime}
                onChange={e => onChange({ ...settings, maxTime: Number(e.target.value) })}                className="w-24 accent-red-600"
              />
              <span className="text-neutral-300 w-8 text-right">{settings.maxTime}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
