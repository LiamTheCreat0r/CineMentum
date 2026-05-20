import SettingsPanel from './SettingsPanel'

export default function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white gap-6 bg-[radial-gradient(ellipse_at_center,_#1a0505_0%,_#0a0a0a_60%,_#000_100%)]">
      <h1 className="text-5xl font-bold tracking-tight">CINE<span className="text-red-600 animate-glow">ATLAS</span></h1>
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
      <SettingsPanel />
    </div>
  )
}
