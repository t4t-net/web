import type { ComponentChildren } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

const TWINKLE = ['.', '+', '*', '✦', '*', '+']
const PERIOD = 28 // ticks per twinkle cycle; most of it is spent resting
const TICK_MS = 120

// cheap integer hash so sparkle placement is stable across renders
function hash(n: number) {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  return (n ^ (n >>> 16)) >>> 0
}

const TWINKLE_STAR = ['.', '+', '☆', '★', '☆', '+']
// kaomoji usually use halfwidth katakana (ﾟ･｡) here, but most mono stacks
// have no glyphs for it and render tofu, so stick to latin-1 lookalikes
const TRAILS = ['☆°.*·.°', '*:·°✧', '✧·°:*', '⋆.˚☆', '.°☆°.', '.·:*✧']
const MASCOT = '\\(°▽°)/*:·°✧'
// symbol glyphs can come from a wider fallback font, so slots get some slack
const slotWidth = (s: string) => [...s].length + 2

// one thing drawn on the border; x, y and w are in grid cells
type Item = { kind: 'cell' | 'trail' | 'corner' | 'mascot'; id: number; x: number; y: number; w: number; text?: string }
type Colors = { fg: string; alt: string; text: string }

// a run of n cells along row y, with kaomoji star trails every ~20 cells (jittered)
function trailLine(out: Item[], side: number, y: number, n: number, reserveEnd = 0) {
  const end = n - reserveEnd
  let next = 4 + (hash(side) % 8) // where the next trail starts
  let k = side // rotate through TRAILS so neighbours never repeat
  let i = 0
  while (i < end) {
    const id = side * 4096 + i
    const h = hash(id)
    const text = TRAILS[k % TRAILS.length]
    const w = slotWidth(text)
    if (i >= next && i + w + 4 <= end) {
      out.push({ kind: 'trail', id, x: i + 1, y, w, text })
      i += w
      k++
      next = i + 10 + (h % 6)
    } else {
      out.push({ kind: 'cell', id, x: i + 1, y, w: 1 })
      i++
    }
  }
}

function layout(cols: number, rows: number): Item[] {
  const out: Item[] = []
  const corner = (x: number, y: number) => out.push({ kind: 'corner', id: 0, x, y, w: 1, text: '✦' })
  corner(0, 0); corner(cols + 1, 0); corner(0, rows + 1); corner(cols + 1, rows + 1)

  trailLine(out, 1, 0, cols)
  for (let i = 0; i < rows; i++) {
    out.push({ kind: 'cell', id: 2 * 4096 + i, x: 0, y: i + 1, w: 1 })
    out.push({ kind: 'cell', id: 3 * 4096 + i, x: cols + 1, y: i + 1, w: 1 })
  }

  // only show the mascot when there's room for it plus some border either side
  const mascotW = slotWidth(MASCOT)
  const showMascot = cols >= mascotW + 6
  const bottom = rows + 1
  trailLine(out, 4, bottom, cols, showMascot ? mascotW + 2 : 0)
  if (showMascot) {
    const x = cols + 1 - mascotW - 2
    out.push({ kind: 'mascot', id: 0, x, y: bottom, w: mascotW, text: MASCOT })
    out.push({ kind: 'cell', id: 4 * 4096 + 4000, x: x + mascotW, y: bottom, w: 1 })
    out.push({ kind: 'cell', id: 4 * 4096 + 4001, x: x + mascotW + 1, y: bottom, w: 1 })
  }
  return out
}

// what an item looks like at tick t: [glyphs, color, alpha]
function look(it: Item, t: number, c: Colors): [string, string, number] {
  const h = hash(it.id)
  const color = h & 16 ? c.alt : c.fg
  switch (it.kind) {
    case 'corner': return [it.text!, c.fg, 1]
    case 'mascot': return [it.text!, c.text, 1]
    case 'trail': {
      // stars inside a trail blink filled/hollow on their own phase
      const lit = (t + (h >>> 8)) % 12 < 4
      return [lit ? it.text!.replace(/☆/g, '★').replace(/✧/g, '✦') : it.text!, color, 1]
    }
    case 'cell': {
      // the frame has a solid bg, so 25% alpha text matches the old color-mix dim dot
      if (h % 9 !== 0) return ['·', c.text, 0.25]
      const step = (t + (h >>> 8)) % PERIOD
      const seq = h & 32 ? TWINKLE_STAR : TWINKLE
      return [step < seq.length ? seq[step] : '.', color, 1]
    }
  }
}

export function SparkleFrame({ children }: { children: ComponentChildren }) {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = ref.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let items: Item[] = []
    let w = 0, h = 0, cellW = 9, cellH = 15, t = 0

    const draw = () => {
      const css = getComputedStyle(el)
      const c = {
        fg: css.getPropertyValue('--fg'),
        alt: css.getPropertyValue('--alt'),
        text: css.getPropertyValue('--text'),
      }
      ctx.clearRect(0, 0, w, h)
      for (const it of items) {
        const [glyphs, color, alpha] = look(it, t, c)
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.fillText(glyphs, (it.x + it.w / 2) * cellW, (it.y + 0.5) * cellH)
      }
      ctx.globalAlpha = 1
    }

    const resize = (bw: number, bh: number) => {
      const css = getComputedStyle(el)
      const fontSize = parseFloat(css.fontSize)
      const dpr = window.devicePixelRatio || 1
      w = bw; h = bh
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${fontSize}px ${css.fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      // cells are sized off '0' then stretched so corners land flush on the edges
      const cols = Math.max(0, Math.floor(w / ctx.measureText('0').width) - 2)
      const rows = Math.max(0, Math.floor(h / fontSize) - 2)
      cellW = w / (cols + 2)
      cellH = h / (rows + 2)
      items = layout(cols, rows)
      draw()
    }

    const r = el.getBoundingClientRect()
    resize(r.width, r.height)
    const obs = new ResizeObserver(([e]) => {
      const b = e.borderBoxSize[0]
      resize(b.inlineSize, b.blockSize)
    })
    obs.observe(el)
    // colors live in css vars keyed off data-theme, so repaint when it flips
    const themeObs = new MutationObserver(draw)
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tick = reduced ? 0 : setInterval(() => { t++; draw() }, TICK_MS)
    return () => { clearInterval(tick); obs.disconnect(); themeObs.disconnect() }
  }, [])

  return (
    <div ref={ref} className="frame">
      <canvas ref={canvasRef} className="edge" aria-hidden="true" />
      {children}
    </div>
  )
}
