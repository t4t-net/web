#!/usr/bin/env node
// generates public/avatar.png — 1000x1000 static flag for social profiles
import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const W = 1000, H = 1000
const FLAG_COLS = 20, FLAG_ROWS = 5, MAX_AMP = 2, FREQ = 0.6, SPEED = 2.5
const RENDER_ROWS = FLAG_ROWS + MAX_AMP  // 7
const t = 0

const stripes = ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']

// width is the constraint: 21 cols (pole + 20 flag) must fit in W
const CELL_W = Math.floor(W / (FLAG_COLS + 1))           // 47
const CELL_H = Math.round(CELL_W / 0.6)                  // 78 — monospace ratio
const OX = Math.round((W - (FLAG_COLS + 1) * CELL_W) / 2)
const FLAG_CENTER_X = OX + CELL_W + Math.round((FLAG_COLS * CELL_W) / 2)

const POLE_W = 16
const POLE_X = OX + Math.round((CELL_W - POLE_W) / 2)

const textColors = ['#5BCEFA', '#F5A9B8', '#FFFFFF']
const FONT_SIZE = 100
const CHAR_W = Math.round(FONT_SIZE * 0.6)
const chars = 't4t.net'.split('')
const textStartX = FLAG_CENTER_X - Math.round((chars.length * CHAR_W) / 2)

// center the whole content block (text + gap + flag) vertically
const TEXT_H = FONT_SIZE
const GAP = 40
const FLAG_H = RENDER_ROWS * CELL_H
const CONTENT_H = TEXT_H + GAP + FLAG_H
const contentTop = Math.round((H - CONTENT_H) / 2)
const textY = contentTop + TEXT_H
const FLAG_Y = contentTop + TEXT_H + GAP

let flagCells = ''
let overlay = ''

// text
for (let i = 0; i < chars.length; i++) {
  const color = textColors[i % textColors.length]
  const cx = textStartX + i * CHAR_W + Math.round(CHAR_W / 2)
  overlay += `<text x="${cx}" y="${textY}" font-family="monospace" font-size="${FONT_SIZE}" font-weight="700" fill="${color}" text-anchor="middle">${chars[i]}</text>`
}

// flag cells
for (let r = 0; r < RENDER_ROWS; r++) {
  for (let c = 0; c < FLAG_COLS; c++) {
    const amp = MAX_AMP * (c / (FLAG_COLS - 1))
    const disp = amp * Math.sin(FREQ * c - SPEED * t)
    const stripeR = r - disp
    if (stripeR >= 0 && stripeR < FLAG_ROWS) {
      const idx = Math.max(0, Math.min(4, Math.floor(stripeR)))
      flagCells += `<rect x="${OX + CELL_W + c * CELL_W}" y="${FLAG_Y + r * CELL_H}" width="${CELL_W}" height="${CELL_H}" fill="${stripes[idx]}"/>`
    }
  }
}

// pole drawn on top of flag cells
overlay += `<rect x="${POLE_X}" y="${FLAG_Y}" width="${POLE_W}" height="${RENDER_ROWS * CELL_H}" fill="#999"/>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#040c12"/>
  ${flagCells}
  ${overlay}
</svg>`

await sharp(Buffer.from(svg)).png().toFile(join(root, 'public/avatar.png'))
console.log('wrote public/avatar.png')
