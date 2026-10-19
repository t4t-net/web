import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { measureCharWidth } from './TransFlag'

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

function Cell({ id, t }: { id: number; t: number }) {
  const h = hash(id)
  if (h % 9 !== 0) return <span className="dot">·</span>
  const step = (t + (h >>> 8)) % PERIOD
  const seq = h & 32 ? TWINKLE_STAR : TWINKLE
  const glyph = step < seq.length ? seq[step] : '.'
  return <span className={h & 16 ? 'spark alt' : 'spark'}>{glyph}</span>
}

// stars inside a trail blink filled/hollow on their own phase
function Trail({ id, text, t }: { id: number; text: string; t: number }) {
  const h = hash(id)
  const lit = (t + (h >>> 8)) % 12 < 4
  const shown = lit ? text.replace(/☆/g, '★').replace(/✧/g, '✦') : text
  return (
    <span className={h & 16 ? 'trail alt' : 'trail'} style={{ width: `${slotWidth(text)}ch` }}>
      {shown}
    </span>
  )
}

// a run of n cells, with kaomoji star trails every ~20 cells (jittered)
function trailLine(side: number, n: number, t: number, reserveEnd = 0) {
  const out = []
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
      out.push(<Trail key={i} id={id} text={text} t={t} />)
      i += w
      k++
      next = i + 10 + (h % 6)
    } else {
      out.push(<Cell key={i} id={id} t={t} />)
      i++
    }
  }
  return out
}

function useTick() {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setT(t => t + 1), TICK_MS)
    return () => clearInterval(id)
  }, [])
  return t
}

export function SparkleFrame({ children }: { children: ComponentChildren }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ cols: 0, rows: 0 })
  const t = useTick()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // cells are sized in ch (the width of '0'), so measure that, not █
    const charW = measureCharWidth(el, '0')
    const lineH = parseFloat(getComputedStyle(el).fontSize)
    const update = (w: number, h: number) => setSize({
      cols: Math.max(0, Math.floor(w / charW) - 2),
      rows: Math.max(0, Math.floor(h / lineH) - 2),
    })
    const r = el.getBoundingClientRect()
    update(r.width, r.height)
    const obs = new ResizeObserver(([e]) => {
      const b = e.borderBoxSize[0]
      update(b.inlineSize, b.blockSize)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const line = (side: number, n: number) =>
    Array.from({ length: n }, (_, i) => <Cell key={i} id={side * 4096 + i} t={t} />)

  // only show the mascot when there's room for it plus some border either side
  const mascotW = slotWidth(MASCOT)
  const showMascot = size.cols >= mascotW + 6

  return (
    <div ref={ref} className="frame">
      <div className="edge top"><span className="corner">✦</span>{trailLine(1, size.cols, t)}<span className="corner">✦</span></div>
      <div className="edge left">{line(2, size.rows)}</div>
      <div className="edge right">{line(3, size.rows)}</div>
      <div className="edge bottom">
        <span className="corner">✦</span>
        {trailLine(4, size.cols, t, showMascot ? mascotW + 2 : 0)}
        {showMascot && <>
          <span className="trail mascot" style={{ width: `${mascotW}ch` }}>{MASCOT}</span>
          <Cell id={4 * 4096 + 4000} t={t} /><Cell id={4 * 4096 + 4001} t={t} />
        </>}
        <span className="corner">✦</span>
      </div>
      {children}
    </div>
  )
}
