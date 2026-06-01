import { useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)

  async function handleSaveImage() {
    const svgEl = containerRef.current?.querySelector('svg')
    if (!svgEl) return

    const { width: w, height: h } = svgEl.getBoundingClientRect()

    const svgContent = new XMLSerializer().serializeToString(svgEl)

    let svg = svgContent
      .replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`)
      .replace(/<defs>/, '<rect width="100%" height="100%" fill="#0a0a0a"/><defs>')

    const imgRe = /(?:href|xlink:href)="(https:\/\/image\.tmdb\.org[^"]+)"/g
    const inlined: { raw: string; data: string }[] = []
    let match: RegExpExecArray | null
    while ((match = imgRe.exec(svg)) !== null) {
      try {
        const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(match[1])}`)
        const blob = await res.blob()
        const data = await new Promise<string>((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(r.result as string)
          r.onerror = reject
          r.readAsDataURL(blob)
        })
        inlined.push({ raw: match[0], data })
      } catch (e) {
        console.warn('SaveImage proxy fail:', match[1], e)
      }
    }
    for (const { raw, data } of inlined) {
      svg = svg.replace(raw, `href="${data}"`)
    }

    svg = svg.replace(
      '</svg>',
      `<text x="20" y="30" fill="#fff" font-family="sans-serif" font-size="20" font-weight="bold">Score: ${score}</text>
      <text x="20" y="55" fill="#aaa" font-family="sans-serif" font-size="14">Nodes: ${nodes.length}</text>
      <text x="20" y="75" fill="#aaa" font-family="sans-serif" font-size="14">Longest Streak: ${longestStreak}</text></svg>`,
    )

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cineatlas-graph.svg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[radial-gradient(ellipse_at_center,_#1a0505_0%,_#0a0a0a_60%,_#000_100%)]">
      <div className="absolute inset-0">
        <GraphMap nodes={nodes} edges={edges} />
      </div>
      <div className="absolute top-0 left-0 right-0 flex items-start justify-center gap-8 pt-6 pointer-events-none z-10">
        <div className="pointer-events-auto">
          <ScoreCard
            nodes={nodes.length}
            longestStreak={longestStreak}
            timeSurvived={timeSurvived}
            score={score}
          />
        </div>
        <div className="pointer-events-auto flex flex-col gap-3 pt-[52px]">
          <button
            onClick={onRestart}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 hover:scale-105 transition-all text-base shadow-lg shadow-red-600/20"
          >
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="px-6 py-2 bg-neutral-800/80 text-neutral-300 font-semibold rounded-lg hover:bg-neutral-700 hover:text-white hover:scale-105 transition-all text-base border border-neutral-700"
          >
            Main Menu
          </button>
          <button
            onClick={handleSaveImage}
            className="px-6 py-2 bg-neutral-800/80 text-neutral-300 font-semibold rounded-lg hover:bg-neutral-700 hover:text-white hover:scale-105 transition-all text-base border border-neutral-700"
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  )
}
