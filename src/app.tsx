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

const QA: { q: string, a: string }[] = [
  {
    q: 'why name an ASN after being trans4trans?',
    a: `because A. nobody's done it before, so i'm gonna be the first, and B. i thought it was cute. plus i had the domain
name for it already, and i already had colo space, so why not go all in on making it gay and transgender? t4t forever bay beeeeee`,
  },
  {
    q: 'i am a mere simpleton and i have no clue what any of this technical wizardry means, can you please explain what it means',
    a: `in simple terms, an ASN is what it takes to become publicly routable on the internet. we flat-out own a sliver of the internet, so to say,
and can use it however the hell we want, and literally anyone in the world can access our infrastructure. it's like the next evolution of homelabbing (and a lot of this came
out of us outgrowing our closet servers and wanting something better for ourselves).`
  },
  {
    q: 'what services do you offer to other trans people?',
    a: `it depends on a case-by-case basis. we currently have 3 servers (well, 4 if you include the switch) deployed in our colo, and have room to expand. we've gone as far as
buying full new servers for people -- it really depends on the budget that we have available at the time. talk to us about your project or your needs and we can (maybe) figure something out.
that being said, if you want a @t4t.net email and you're gay and transgender... let me know (but it will be reclaimed if it is unused for prolonged periods of time since email hosting isn't free)....`
  },
  {
    q: 'oh dearest t4t.net admin, what music are you listening to right now?',
    a: `lex walton - ultimate love forever, saoirse dream - grimdark, friko - something worth waiting for, racing mount pleasant - racing mount pleasant, uhhh.... venturing - ghostholding (what our router is named after!), jane remover - census designated, home is where - the whaler, home is where - i became birds, cameron winter - heavy metal`
  },
  {
    q: 'will you peer with my network?',
    a: `maybe! email us and let's talk about it. bonus points if you're gay and transgender!`
  },
  {
    q: `why don't you work with either of the two gay and transgender hackerspaces in seattle that have ASNs?`,
    a: `because my stalker ex is at one of them (making me effectively persona-non-grata for reasons i have not quite understood), and the other is toxic (and has questionable cybersecurity practices). no thank you!!!! good vibes only!!!!`
  }
]

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
          <h2>q&amp;a</h2>
          {QA.map(({ q, a }) => (
            <dl className="qa" key={q}>
              <dt>q:</dt><dd className="q">{q}</dd>
              <dt>a:</dt><dd>{a}</dd>
            </dl>
          ))}
        </section>

        <section>
          <h2>noc</h2>
          <dl className="kv">
            <dt>signal</dt><dd>@catmoding.02</dd>
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
