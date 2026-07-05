#!/usr/bin/env node
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/og.svg'))
await sharp(svg).png().toFile(join(root, 'public/og.png'))
console.log('wrote public/og.png')
