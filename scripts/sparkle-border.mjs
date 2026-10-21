// sparkle border shared by gen-og.mjs and gen-avatar.mjs — a frozen frame of Sparkles.tsx
// every glyph gets its own <text> centred in a cell, so fallback-font widths can't drift

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const glyph = (x, y, ch, fill, size, opacity = 1) =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="monospace" font-size="${size}" fill="${fill}" fill-opacity="${opacity}" text-anchor="middle">${esc(ch)}</text>`

export function hash(n) {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b)
  return (n ^ (n >>> 16)) >>> 0
}

export const DIM = '#383e41' // --text at 25% over the bg, same as .edge .dot
export const TEXT = '#d6d3cf'
export const MASCOT = '\\(°▽°)/*:·°✧'
const SPARKS = ['✦', '*', '+', '☆', '★', '✧']
const TRAILS = ['☆°.*·.°', '*:·°✧', '✧·°:*', '⋆.˚☆', '.°☆°.', '.·:*✧']

// latin-1 lookalikes only: halfwidth katakana renders as tofu in most mono stacks
const makeCell = stripes => id => {
  const h = hash(id)
  if (h % 9 !== 0) return { ch: '·', fill: DIM }
  return { ch: SPARKS[(h >>> 8) % SPARKS.length], fill: h & 16 ? stripes[1] : stripes[0] }
}

// one row of n cells: dots + sparkles, star trails every ~20 cells, optional text pinned at the end
function edgeRow(stripes, side, n, tail = '') {
  const cell = makeCell(stripes)
  const row = Array.from({ length: n }, (_, i) => cell(side * 4096 + i))
  const end = n - (tail ? [...tail].length + 3 : 0)
  let k = side
  for (let i = 4 + (hash(side) % 8); ; ) {
    const t = [...TRAILS[k++ % TRAILS.length]]
    if (i + t.length + 4 > end) break
    t.forEach((ch, j) => { row[i + 1 + j] = { ch, fill: k & 1 ? stripes[0] : stripes[1] } })
    row[i] = row[i + t.length + 1] = { ch: ' ', fill: DIM }
    i += t.length + 2 + 10 + (hash(side * 4096 + i) % 6)
  }
  if (tail) {
    [...tail].forEach((ch, j) => { row[end + 1 + j] = { ch, fill: TEXT } })
    row[end] = row[n - 2] = { ch: ' ', fill: DIM } // breathing room either side
  }
  return row
}

export function sparkleBorder({ W, H, stripes, tail = '', margin = 22, size = 20, cellW = 12 }) {
  const cell = makeCell(stripes)
  let out = ''
  const M = margin
  const cols = Math.floor((W - 2 * M) / cellW)
  const stepX = (W - 2 * M) / cols
  const topY = M + size * 0.75, botY = H - M
  const top = edgeRow(stripes, 1, cols), bottom = edgeRow(stripes, 4, cols, tail)
  for (let i = 0; i < cols; i++) {
    const x = M + (i + 0.5) * stepX
    const isCorner = i === 0 || i === cols - 1
    out += glyph(x, topY, isCorner ? '✦' : top[i].ch, isCorner ? stripes[0] : top[i].fill, size)
    out += glyph(x, botY, isCorner ? '✦' : bottom[i].ch, isCorner ? stripes[0] : bottom[i].fill, size)
  }
  const rows = Math.floor((botY - topY) / size) - 1
  const stepY = (botY - topY) / (rows + 1)
  for (let r = 1; r <= rows; r++) {
    const y = topY + r * stepY
    const l = cell(2 * 4096 + r), rt = cell(3 * 4096 + r)
    out += glyph(M + stepX / 2, y, l.ch, l.fill, size)
    out += glyph(W - M - stepX / 2, y, rt.ch, rt.fill, size)
  }
  return out
}

// the same border bent into a circle, for avatars that get cropped round.
// cells run clockwise from just right of 6 o'clock; the tail text gets the bottom
// arc to itself, drawn left-to-right with each glyph rotated to follow the curve
export function sparkleRing({ cx, cy, r, stripes, tail = '', size = 26, cellW = 16 }) {
  const rad = d => d * Math.PI / 180
  const at = deg => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg)) + size * 0.35]
  const degPerCell = cellW / r * 180 / Math.PI
  const tailChars = [...tail]
  const half = tailChars.length ? (tailChars.length / 2 + 1) * degPerCell : 0

  let out = ''
  tailChars.forEach((ch, i) => {
    const deg = 90 + half - (i + 1.5) * degPerCell // 90° is straight down in svg coords
    const [x, y] = at(deg)
    out += glyph(x, y, ch, TEXT, size).replace('<text ', `<text transform="rotate(${(deg - 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" `)
  })

  const span = 360 - 2 * half
  const n = Math.floor(span / degPerCell)
  const row = edgeRow(stripes, 7, n)
  row.forEach((c, i) => {
    const [x, y] = at(90 + half + (i + 0.5) * span / n)
    out += glyph(x, y, c.ch, c.fill, size)
  })
  return out
}
