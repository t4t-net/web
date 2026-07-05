#!/usr/bin/env node
// generates public/og.png — same wave math as TransFlag.tsx, frozen at t=0
import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const W = 1200, H = 630
const FLAG_COLS = 20, FLAG_ROWS = 5, MAX_AMP = 2, FREQ = 0.6, SPEED = 2.5
const RENDER_ROWS = FLAG_ROWS + MAX_AMP  // 7
const t = 0

const stripes = ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']

// cells fill full height: RENDER_ROWS * CELL_H = H
const CELL_H = H / RENDER_ROWS          // 90
const CELL_W = Math.round(CELL_H * 0.6) // 54 — monospace aspect ratio
const OX = Math.round((W - FLAG_COLS * CELL_W) / 2)  // center horizontally

let rects = ''
for (let r = 0; r < RENDER_ROWS; r++) {
  for (let c = 0; c < FLAG_COLS; c++) {
    const amp = MAX_AMP * (c / (FLAG_COLS - 1))
    const disp = amp * Math.sin(FREQ * c - SPEED * t)
    const stripeR = r - disp
    if (stripeR >= 0 && stripeR < FLAG_ROWS) {
      const idx = Math.max(0, Math.min(4, Math.floor(stripeR)))
      rects += `<rect x="${OX + c * CELL_W}" y="${r * CELL_H}" width="${CELL_W}" height="${CELL_H}" fill="${stripes[idx]}"/>`
    }
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#040c12"/>
  ${rects}
</svg>`

await sharp(Buffer.from(svg)).png().toFile(join(root, 'public/og.png'))
console.log('wrote public/og.png')
