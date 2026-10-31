import type { ComponentChildren, RefObject } from 'preact'
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

// below this many columns (phones), plain cells along the top and bottom are spaced
// to match the side cells' pitch instead of 1ch, so the rows don't look bunched
const NARROW_COLS = 56

// a run of n columns along row y starting at column x0, with kaomoji star trails
// every ~20 columns (jittered); plain cells are nominally step columns wide
function trailLine(out: Item[], side: number, y: number, x0: number, n: number, step: number, reserveEnd = 0) {
  const end = n - reserveEnd
  const run: { id: number; text?: string; w: number }[] = []
  let next = 4 + (hash(side) % 8) // where the next trail starts
  let k = side // rotate through TRAILS so neighbours never repeat
  let i = 0
  while (end - i >= step / 2) {
    const id = side * 4096 + Math.floor(i)
    const h = hash(id)
    const text = TRAILS[k % TRAILS.length]
    const w = slotWidth(text)
    if (i >= next && i + w + 4 <= end) {
      run.push({ id, text, w })
      i += w
      k++
      next = i + 10 + (h % 6)
    } else {
      run.push({ id, w: step })
      i += step
    }
  }
  // step rarely divides the run evenly, so stretch just the plain cells to fill it exactly
  const trailW = run.reduce((a, r) => a + (r.text ? r.w : 0), 0)
  const cells = run.filter(r => !r.text).length
  const cw = cells ? (end - trailW) / cells : step
  let x = x0
  for (const r of run) {
    const w = r.text ? r.w : cw
    out.push(r.text ? { kind: 'trail', id: r.id, x, y, w, text: r.text } : { kind: 'cell', id: r.id, x, y, w })
    x += w
  }
}

// step is how many columns wide a plain top/bottom cell is
function layout(cols: number, rows: number, step: number): Item[] {
  const out: Item[] = []
  const corner = (x: number, y: number) => out.push({ kind: 'corner', id: 0, x, y, w: 1, text: '✦' })
  corner(0, 0); corner(cols + 1, 0); corner(0, rows + 1); corner(cols + 1, rows + 1)

  // pad the row ends so the first cell sits one full step from each corner
  const pad = (step - 1) / 2
  const inner = cols - 2 * pad
  trailLine(out, 1, 0, 1 + pad, inner, step)
  for (let i = 0; i < rows; i++) {
    out.push({ kind: 'cell', id: 2 * 4096 + i, x: 0, y: i + 1, w: 1 })
    out.push({ kind: 'cell', id: 3 * 4096 + i, x: cols + 1, y: i + 1, w: 1 })
  }

  // only show the mascot when there's room for it plus some border either side
  const mascotW = slotWidth(MASCOT)
  const showMascot = inner >= mascotW + 6 * step
  const bottom = rows + 1
  trailLine(out, 4, bottom, 1 + pad, inner, step, showMascot ? mascotW + 2 * step : 0)
  if (showMascot) {
    const x = cols + 1 - pad - mascotW - 2 * step
    out.push({ kind: 'mascot', id: 0, x, y: bottom, w: mascotW, text: MASCOT })
    out.push({ kind: 'cell', id: 4 * 4096 + 4000, x: x + mascotW, y: bottom, w: step })
    out.push({ kind: 'cell', id: 4 * 4096 + 4001, x: x + mascotW + step, y: bottom, w: step })
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

export function SparkleFrame({ frameRef: ref, children }: { frameRef: RefObject<HTMLDivElement>; children: ComponentChildren }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = ref.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let items: Item[] = []
    // '.' inks on the baseline and '·' at mid-height, so centering the em box
    // leaves single glyphs at uneven heights; nudge each one so its ink is centered
    const inkShift = new Map<string, number>()
    const shift = (g: string) => {
      let d = inkShift.get(g)
      if (d === undefined) {
        const m = ctx.measureText(g)
        d = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
        inkShift.set(g, d)
      }
      return d
    }
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
        // trails and the mascot keep normal text layout, their ups and downs are the look
        const dy = it.kind === 'cell' || it.kind === 'corner' ? shift(glyphs) : 0
        ctx.fillText(glyphs, (it.x + it.w / 2) * cellW, (it.y + 0.5) * cellH + dy)
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
      inkShift.clear() // the font may have changed
      // on narrow frames, space top/bottom cells at the side columns' pitch
      items = layout(cols, rows, cols < NARROW_COLS ? cellH / cellW : 1)
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
