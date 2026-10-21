import { useEffect, useRef, useState } from 'preact/hooks'
import { TransFlag, FLAG_COLORS } from './TransFlag'
import { SparkleFrame } from './Sparkles'
import { KaomojiRain } from './KaomojiRain'

function useFaviconFlag(theme: string) {
  const colorsRef = useRef(FLAG_COLORS[theme] ?? FLAG_COLORS.trans)
  useEffect(() => { colorsRef.current = FLAG_COLORS[theme] ?? FLAG_COLORS.trans }, [theme])
  useEffect(() => {
    const W = 32, H = 32, ROWS = 5, AMP = 2, FREQ = 0.375, SPEED = 2.5
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!
    const link = document.createElement('link')
    link.rel = 'icon'; link.type = 'image/png'
    document.head.appendChild(link)
    let t = 0
    const id = setInterval(() => {
      const colors = colorsRef.current
      for (let py = 0; py < H; py++)
        for (let px = 0; px < W; px++) {
          const disp = AMP * (px / (W - 1)) * Math.sin(FREQ * px - SPEED * t)
          const idx = Math.max(0, Math.min(4, Math.floor(py / H * ROWS - disp)))
          ctx.fillStyle = colors[idx]
          ctx.fillRect(px, py, 1, 1)
        }
      link.href = canvas.toDataURL()
      t += 0.05
    }, 50)
    return () => { clearInterval(id); link.remove() }
  }, [])
}

type Theme = 'trans' | 'lesbian' | 'bisexual' | 'nonbinary'
const THEMES: Theme[] = ['trans', 'lesbian', 'bisexual', 'nonbinary']
const THEME_KEY = 'theme'

function loadTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (THEMES.includes(t as Theme)) return t as Theme
  } catch {}
  return 'trans'
}

export function App() {
  const [theme, setTheme] = useState<Theme>(loadTheme)
  useFaviconFlag(theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch {}
  }, [theme])

  return (
    <>
    <KaomojiRain theme={theme} />
    <main>
      <SparkleFrame>
        <header>
          <div className="flag"><TransFlag theme={theme} /></div>
          <div>
            <h1>t4t.net</h1>
            <dl className="facts">
              <dt>asn</dt><dd>AS395388</dd>
              <dt>host</dt><dd>ghostholding.sea.t4t.net</dd>
              <dt>os</dt><dd>NixOS 26.05</dd>
              <dt>where</dt><dd>KOMO Plaza, Seattle</dd>
              <dt>pronouns</dt><dd>it/its</dd>
            </dl>
          </div>
        </header>

        <section>
          <p>
            t4t.net is an experimental autonomous system for trans people, by
            trans people. we use it for BGP routing experiments and general
            network research.
          </p>
          <p>
            we run compute &amp; networking out of KOMO Plaza in Seattle on a
            best-effort basis. nothing here is guaranteed to stay up, and no,
            i will never sign an SLA. this is a side project, not a job.
          </p>
          <p>
            the whole fleet runs <a href="https://nixos.org/">NixOS</a>,
            including our Mellanox switch, and we don't plan on supporting
            anything else. sorry.
          </p>
        </section>

        <section>
          <h2>routing</h2>
          <pre>{
`aut-num:    AS395388
as-name:    T4T-NET
descr:      for trans people, by trans people
member-of:  AS-TRANSGENDER
import:     from `}<a href="https://bgp.tools/as/26073">AS26073</a>{` accept ANY   `}<span className="c"># cofractal, transit</span>{`
export:     to AS26073 announce AS395388
remarks:    geofeed `}<a href="https://t4t.net/geofeed.csv">https://t4t.net/geofeed.csv</a>{`

route:      23.190.72.0/24
origin:     AS395388

route6:     2620:c2:2000::/48
origin:     AS395388`
          }</pre>
        </section>

        <section>
          <h2>services</h2>
          <dl className="kv">
            <dt><a href="https://lg.t4t.net">lg.t4t.net</a></dt><dd>looking glass</dd>
            <dt><a href="https://status.t4t.net">status.t4t.net</a></dt><dd>is it up? probably</dd>
            <dt><a href="https://ca.t4t.net">ca.t4t.net</a></dt><dd>internal PKI &amp; TLS certs</dd>
            <dt><a href="https://bao.t4t.net:8200">bao.t4t.net</a></dt><dd>OpenBao, secrets</dd>
          </dl>
        </section>

        <section>
          <h2>noc</h2>
          <dl className="kv">
            <dt>email</dt><dd><a href="mailto:noc@t4t.net">noc@t4t.net</a></dd>
            <dt>abuse</dt><dd><a href="mailto:abuse@t4t.net">abuse@t4t.net</a></dd>
            <dt>hours</dt><dd>9am to 5pm pacific, give or take</dd>
          </dl>
        </section>

        <footer>
          <div className="themes">
            {THEMES.map(t => (
              <button key={t} aria-pressed={theme === t} onClick={() => setTheme(t)}>{t}</button>
            ))}
          </div>
          <p>
            made by <a href="https://catmod.ing">catmod.ing</a> &amp; luna the trans puppygirl
          </p>
          <p>
            cats rule, bunnies drool
          </p>
        </footer>
      </SparkleFrame>
    </main>
    </>
  )
}
