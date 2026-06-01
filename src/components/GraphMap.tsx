import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import type { GraphNode, GraphEdge } from '../types'
import { TMDB_IMAGE_BASE } from '../constants'

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
  frozen?: boolean
}

const ZOOM_TICK = 30

export default function GraphMap({ nodes, edges, frozen }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const prevLen = useRef(0)
  const savedPos = useRef<Map<string, { x: number; y: number }>>(new Map())

  useEffect(() => {
    if (!svgRef.current) return
    const svgEl = svgRef.current
    const width = svgEl.clientWidth
    const height = svgEl.clientHeight

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const defs = svg.append('defs')

    defs.append('pattern')
      .attr('id', 'dotgrid')
      .attr('width', 24)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse')
      .append('circle')
      .attr('cx', 2)
      .attr('cy', 2)
      .attr('r', 1)
      .attr('fill', '#222')


    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#dotgrid)')

    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 6]).on('zoom', (event) => {
      g.attr('transform', event.transform)
    })
    if (!frozen) {
      svg.call(zoom)
    }

    const restored = savedPos.current
    const newNodeAdded = nodes.length > prevLen.current
    nodes.forEach(n => {
      const saved = restored.get(n.id)
      if (saved) {
        n.x = saved.x
        n.y = saved.y
      } else {
        n.x = width / 2 + (Math.random() - 0.5) * 60
        n.y = height / 2 + (Math.random() - 0.5) * 60
      }
    })
    prevLen.current = nodes.length

    if (!frozen) {
      const first = nodes[0]
      const t = d3.zoomIdentity.translate(width / 2, height / 2).scale(2).translate(-first.x!, -first.y!)
      svg.call(zoom.transform, t)
    }

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(130))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(70))

    const linkGroup = g.append('g')
    const nodeGroup = g.append('g')

    let tickCount = 0
    let zoomed = !newNodeAdded || nodes.length <= 1

    function tick() {
      tickCount++

      linkGroup.selectAll<SVGLineElement, any>('line')
        .data(edges)
        .join('line')
        .attr('stroke', '#444')
        .attr('stroke-width', 1.5)
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      linkGroup.selectAll<SVGTextElement, any>('text')
        .data(edges)
        .join('text')
        .attr('fill', '#666')
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .text('appeared in')
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 8)

      const nodeSel = nodeGroup.selectAll<SVGGElement, any>('g')
        .data(nodes)
        .join(
          enter => enter.append('g').attr('class', 'animate-node-enter'),
        )
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)

      nodeSel.selectAll<SVGImageElement, any>('image')
        .data((d: any) => [d])
        .join('image')
        .attr('href', (d: any) => {
          const path = d.type === 'film' || d.type === 'tv' ? d.posterPath : d.profilePath
          return path ? `${TMDB_IMAGE_BASE}${path}` : ''
        })
        .attr('width', (d: any) => d.type === 'actor' ? 40 : 50)
        .attr('height', (d: any) => d.type === 'actor' ? 40 : 75)
        .attr('x', (d: any) => d.type === 'actor' ? -20 : -25)
        .attr('y', (d: any) => d.type === 'actor' ? -20 : -37)
        .attr('clip-path', (d: any) => d.type === 'actor' ? 'circle(20px)' : d.type === 'tv' ? 'inset(0 round 6px)' : '')

      nodeSel.selectAll<SVGRectElement, any>('rect.film-border')
        .data((d: any) => d.type === 'film' ? [d] : [])
        .join('rect')
        .attr('class', `film-border${frozen ? '' : ' animate-glow-film'}`)
        .attr('x', -26)
        .attr('y', -38)
        .attr('width', 52)
        .attr('height', 77)
        .attr('rx', 6)
        .attr('fill', 'none')
        .attr('stroke', '#dc2626')
        .attr('stroke-width', 2)

      nodeSel.selectAll<SVGRectElement, any>('rect.tv-border')
        .data((d: any) => d.type === 'tv' ? [d] : [])
        .join('rect')
        .attr('class', `tv-border${frozen ? '' : ' animate-glow-tv'}`)
        .attr('x', -26)
        .attr('y', -38)
        .attr('width', 52)
        .attr('height', 77)
        .attr('rx', 6)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)

      nodeSel.selectAll<SVGCircleElement, any>('circle.actor-border')
        .data((d: any) => d.type === 'actor' ? [d] : [])
        .join('circle')
        .attr('class', `actor-border${frozen ? '' : ' animate-glow-actor'}`)
        .attr('r', 21)
        .attr('fill', 'none')
        .attr('stroke', '#eab308')
        .attr('stroke-width', 2.5)

      nodeSel.selectAll<SVGTextElement, any>('text')
        .data((d: any) => [d])
        .join('text')
        .attr('fill', '#ccc')
        .attr('font-size', 11)
        .attr('text-anchor', 'middle')
        .attr('y', (d: any) => (d.type === 'actor' ? 30 : 50))
        .text((d: any) => d.label.length > 18 ? d.label.slice(0, 17) + '…' : d.label)

      if (!frozen) {
        nodeSel.call(d3.drag<SVGGElement, any>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          }) as any)
      }

      if (!zoomed && tickCount >= ZOOM_TICK) {
        zoomed = true
        const last = nodes[nodes.length - 1]
        if (last.x != null && last.y != null && !frozen) {
          const t = d3.zoomIdentity.translate(width / 2, height / 2).scale(2).translate(-last.x, -last.y)
          svg.transition().duration(400).call(zoom.transform as any, t)
        }
      }
    }

    if (frozen) {
      for (let i = 0; i < 100; i++) simulation.tick()
      tick()
      simulation.stop()
    } else {
      simulation.on('tick', tick)
    }

    return () => {
      if (!frozen) {
        const pos = new Map<string, { x: number; y: number }>()
        nodes.forEach(n => {
          if (n.x != null && n.y != null) {
            pos.set(n.id, { x: n.x, y: n.y })
          }
        })
        savedPos.current = pos
      }
      simulation.stop()
    }
  }, [nodes, edges, frozen])

  return (
    <svg ref={svgRef} className="w-full h-full bg-neutral-950" />
  )
}
