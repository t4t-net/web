// trans flag screensaver - inject into any page and watch it go :3
// usage: drop a <script src="trans-flag-bounce.js"></script> anywhere
//        or paste the whole thing into your browser console
// call it multiple times to get SEVERAL flags bouncing around >w<
// optional: set data-theme="trans|lesbian|bisexual|nonbinary" on the script tag
//           or window.transFlagTheme as a fallback (e.g. when pasting into console)
// window.__stopAllTransFlags() removes them all
(function () {
  const FLAG_ROWS = 10
  const MAX_AMP = 2
  const RENDER_ROWS = FLAG_ROWS + MAX_AMP
  const FREQ = 0.6
  const SPEED = 2.5
  const COLS = 20

  const FLAG_COLORS = {
    trans:    ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA'],
    lesbian:  ['#D62900', '#FF9B55', '#FFFFFF', '#D461A6', '#A50062'],
    bisexual: ['#D60270', '#D60270', '#9B4F96', '#0038A8', '#0038A8'],
    nonbinary:['#FCF434', '#FCF434', '#FFFFFF', '#9C59D1', '#2D2D2D'],
  }

  const theme = (document.currentScript && document.currentScript.dataset.theme)
    || window.transFlagTheme
    || 'trans'
  const stripes = FLAG_COLORS[theme] || FLAG_COLORS.trans

  const container = document.createElement('div')
  container.id = '__trans-flag-bounce-' + Math.random().toString(36).slice(2)
  container.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'z-index:2147483647',
    'pointer-events:none',
    'font-family:monospace',
    'font-size:14px',
    'line-height:1em',
    'user-select:none',
  ].join(';')
  document.body.appendChild(container)

  const spanGrid = []
  for (let r = 0; r < RENDER_ROWS; r++) {
    const rowDiv = document.createElement('div')
    rowDiv.style.cssText = 'display:flex'

    const pipe = document.createElement('span')
    pipe.textContent = '||'
    pipe.style.color = '#555'
    rowDiv.appendChild(pipe)

    const rowSpans = []
    for (let c = 0; c < COLS; c++) {
      const span = document.createElement('span')
      span.textContent = '█'
      rowDiv.appendChild(span)
      rowSpans.push(span)
    }
    spanGrid.push(rowSpans)
    container.appendChild(rowDiv)
  }

  let x = 0
  let y = 0
  let dx = 2
  let dy = 1.5
  let time = 0
  let sized = false

  function tick() {
    time += 0.05

    for (let r = 0; r < RENDER_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const amp = MAX_AMP * (c / (COLS - 1))
        const disp = amp * Math.sin(FREQ * c - SPEED * time)
        const stripeR = r - disp
        if (stripeR >= 0 && stripeR < FLAG_ROWS) {
          const idx = Math.max(0, Math.min(4, Math.floor(stripeR / 2)))
          spanGrid[r][c].style.color = stripes[idx]
        } else {
          spanGrid[r][c].style.color = 'transparent'
        }
      }
    }

    const rect = container.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (!sized) {
      // start from a random edge so it immediately bounces in
      x = Math.random() * (vw - rect.width)
      y = Math.random() * (vh - rect.height)
      dx = (Math.random() < 0.5 ? 1 : -1) * (1.5 + Math.random())
      dy = (Math.random() < 0.5 ? 1 : -1) * (1 + Math.random())
      sized = true
    }

    x += dx
    y += dy

    if (x + rect.width >= vw) { x = vw - rect.width; dx = -Math.abs(dx) }
    if (x <= 0)               { x = 0;                dx =  Math.abs(dx) }
    if (y + rect.height >= vh) { y = vh - rect.height; dy = -Math.abs(dy) }
    if (y <= 0)               { y = 0;                dy =  Math.abs(dy) }

    container.style.transform = 'translate(' + x + 'px,' + y + 'px)'
  }

  const id = setInterval(tick, 40)

  // registry so you can stop them all at once
  window.__transFlags = window.__transFlags || []
  window.__transFlags.push(function () { clearInterval(id); container.remove() })
  window.__stopAllTransFlags = function () {
    window.__transFlags.forEach(function (stop) { stop() })
    window.__transFlags = []
    delete window.__stopAllTransFlags
  }
})()
