import { useEffect, useState } from 'preact/hooks'

const FLAG_COLS = 20
const FLAG_ROWS = 5
const MAX_AMP = 2
const RENDER_ROWS = FLAG_ROWS + MAX_AMP
const FREQ = 0.6
const SPEED = 2.5

export const FLAG_COLORS: Record<string, string[]> = {
  trans:    ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'],
  lesbian:  ['#D62900', '#FF9B55', '#FFFFFF', '#D461A6', '#A50062'],
  bisexual: ['#D60270', '#D60270', '#9B4F96', '#0038A8', '#0038A8'],
  nonbinary:['#FCF434', '#FCF434', '#FFFFFF', '#9C59D1', '#2D2D2D'],
}

type Props = { theme: string }

export function TransFlag({ theme }: Props) {
  const [time, setTime] = useState(0)
  const stripes = FLAG_COLORS[theme] ?? FLAG_COLORS.trans

  useEffect(() => {
    const id = setInterval(() => setTime(t => t + 0.05), 40)
    return () => clearInterval(id)
  }, [])

  const rows: (string | null)[][] = []
  for (let r = 0; r < RENDER_ROWS; r++) {
    const cells: (string | null)[] = []
    for (let c = 0; c < FLAG_COLS; c++) {
      const amp = MAX_AMP * (c / (FLAG_COLS - 1))
      const disp = amp * Math.sin(FREQ * c - SPEED * time)
      const stripeR = r - disp
      if (stripeR >= 0 && stripeR < FLAG_ROWS) {
        const stripeIdx = Math.max(0, Math.min(4, Math.floor(stripeR)))
        cells.push(stripes[stripeIdx])
      } else {
        cells.push(null)
      }
    }
    rows.push(cells)
  }

  return (
    <div className="font-mono select-none" style={{ lineHeight: '1em' }}>
      {rows.map((row, r) => (
        <div key={r} style={{ display: 'flex' }}>
          <span style={{ color: '#555' }}>│</span>
          {row.map((color, c) => (
            <span key={c} style={{ color: color ?? 'transparent' }}>█</span>
          ))}
        </div>
      ))}
    </div>
  )
}
