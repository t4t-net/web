import { useEffect, useState } from 'preact/hooks'
import { FLAG_COLORS } from './TransFlag'

const CELLS = 10

type Seen = { seeing: number, total: number, since: string }
type State = 'loading' | 'failed' | Seen

// ripestat only fills in the family of the prefix you ask about, so each prefix
// gets its own query and we read just its v4 or v6 half (the other one is 0/0)
function useSeen(prefix: string): State {
  const [seen, setSeen] = useState<State>('loading')
  useEffect(() => {
    const ctl = new AbortController()
    const family = prefix.includes(':') ? 'v6' : 'v4'
    fetch(`https://stat.ripe.net/data/routing-status/data.json?resource=${encodeURIComponent(prefix)}`, { signal: ctl.signal })
      .then(r => r.json())
      .then(({ data }) => {
        const v = data.visibility[family]
        if (!v.total_ris_peers) throw new Error('no ris peers')
        setSeen({ seeing: v.ris_peers_seeing, total: v.total_ris_peers, since: data.first_seen?.time?.slice(0, 10) ?? '' })
      })
      .catch(() => { if (!ctl.signal.aborted) setSeen('failed') })
    return () => ctl.abort()
  }, [prefix])
  return seen
}

// the nonbinary flag's black stripe vanishes on the dark bg and makes a full bar
// look partly empty, so lift stripes that dark toward the text color
function visible(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return r + g + b < 3 * 0x40 ? `color-mix(in srgb, ${hex} 55%, var(--text))` : hex
}

// extra rpsl-ish lines for a route object, painted in the active flag's stripes.
// always rendered, with same-width placeholders until ripestat answers, so nothing jumps
export function RouteSeen({ prefix, theme }: { prefix: string, theme: string }) {
  const seen = useSeen(prefix)
  const done = typeof seen === 'object'
  const colors = FLAG_COLORS[theme] ?? FLAG_COLORS.trans
  const filled = done ? Math.round(seen.seeing / seen.total * CELLS) : 0
  const note = done ? 'live, ripestat' : seen === 'loading' ? 'asking ripestat...' : 'ripestat unreachable'
  return (
    <>
      {'\nseen-by:    '}
      {Array.from({ length: CELLS }, (_, i) => i < filled
        ? <span key={i} style={{ color: visible(colors[Math.floor(i * colors.length / CELLS)]) }}>█</span>
        : <span key={i} className="c">░</span>)}
      {done ? ` ${seen.seeing}/${seen.total} ` : <span className="c"> ---/--- </span>}
      {'RIS peers  '}<span className="c"># {note}</span>
      {'\nsince:      '}{done && seen.since ? seen.since : <span className="c">----------</span>}
    </>
  )
}
