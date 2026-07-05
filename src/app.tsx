import { useState } from 'preact/hooks'
import { TransFlag } from './TransFlag'

type Theme = 'trans' | 'lesbian' | 'bisexual' | 'nonbinary'

export function App() {
  const [theme, setTheme] = useState<Theme>('trans')

  const themeClasses = {
    trans: {
      bg: 'bg-[#040c12]',
      border: 'border-[#5BCEFA]/20',
      text: 'text-[#5BCEFA]',
      textDim: 'text-[#F5A9B8]/80',
      textMuted: 'text-[#5BCEFA]/20',
      accentBg: 'bg-[#5BCEFA]/5',
      buttonActive: 'bg-[#5BCEFA]/20 text-[#5BCEFA] border-[#5BCEFA]/60',
      buttonHover: 'hover:bg-[#F5A9B8]/10 hover:text-[#F5A9B8]',
      glow: 'shadow-[0_0_15px_rgba(91,206,250,0.08)]'
    },
    lesbian: {
      bg: 'bg-[#120608]',
      border: 'border-[#FF9B55]/20',
      text: 'text-[#FF9B55]',
      textDim: 'text-[#D461A6]/80',
      textMuted: 'text-[#FF9B55]/20',
      accentBg: 'bg-[#D62900]/5',
      buttonActive: 'bg-[#FF9B55]/20 text-[#FF9B55] border-[#FF9B55]/60',
      buttonHover: 'hover:bg-[#D461A6]/10 hover:text-[#D461A6]',
      glow: 'shadow-[0_0_15px_rgba(255,155,85,0.08)]'
    },
    bisexual: {
      bg: 'bg-[#0d0408]',
      border: 'border-[#9B4F96]/25',
      text: 'text-[#D60270]',
      textDim: 'text-[#9B4F96]/80',
      textMuted: 'text-[#9B4F96]/25',
      accentBg: 'bg-[#D60270]/5',
      buttonActive: 'bg-[#D60270]/20 text-[#D60270] border-[#D60270]/60',
      buttonHover: 'hover:bg-[#9B4F96]/10 hover:text-[#9B4F96]',
      glow: 'shadow-[0_0_15px_rgba(214,2,112,0.08)]'
    },
    nonbinary: {
      bg: 'bg-[#0c0b04]',
      border: 'border-[#FCF434]/15',
      text: 'text-[#FCF434]',
      textDim: 'text-[#9C59D1]/80',
      textMuted: 'text-[#FCF434]/15',
      accentBg: 'bg-[#FCF434]/5',
      buttonActive: 'bg-[#FCF434]/15 text-[#FCF434] border-[#FCF434]/50',
      buttonHover: 'hover:bg-[#9C59D1]/10 hover:text-[#9C59D1]',
      glow: 'shadow-[0_0_15px_rgba(252,244,52,0.06)]'
    }
  }

  const currentTheme = themeClasses[theme]

  return (
    <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-12 w-full max-w-5xl mx-auto">
      {/* Terminal Window Shell */}
      <div className={`w-full rounded-lg border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.glow} flex flex-col overflow-hidden transition-all duration-300`}>
        
        {/* Terminal Header */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${currentTheme.border} bg-black/40`}>
          <div className="flex items-center space-x-2">
            {/* Window control dots */}
            <span className={`ml-2 text-xs font-mono select-none ${currentTheme.textDim}`}>
              noc@t4t.net $ <span className="text-white">ssh root@ghostholding.sea.t4t.net</span>
            </span>
          </div>
        </div>

        {/* Terminal Content Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-8 font-mono text-sm leading-relaxed overflow-x-auto">
          
          {/* ASCII Banner & Neofetch Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Animated Trans Flag */}
            <div className="md:col-span-6 py-2">
              <TransFlag theme={theme} />
            </div>

            {/* Router Status Info Block */}
            <div className="md:col-span-6 space-y-1">
              <div>
                <span className={`${currentTheme.text}`}>root@ghostholding.sea.t4t.net</span>
                <span className={`${currentTheme.textDim}`}>:</span>
                <span className={`${currentTheme.text}`}>~$ </span>
                <span className="text-white">hostinfo</span>
              </div>
              <div className={`h-px w-full ${currentTheme.border} bg-current opacity-20 my-1`} />
              <div className="grid grid-cols-3 gap-x-2 text-xs sm:text-sm">
                <span className={`${currentTheme.textDim}`}>Hostname:</span>
                <span className="col-span-2 text-white font-medium">ghostholding.sea.t4t.net</span>

                <span className={`${currentTheme.textDim}`}>ASN:</span>
                <span className="col-span-2 text-white font-medium">AS395388</span>

                <span className={`${currentTheme.textDim}`}>OS:</span>
                <span className="col-span-2 text-white">FRR 10.4.1 (NixOS 25.11)</span>

                <span className={`${currentTheme.textDim}`}>Location:</span>
                <span className="col-span-2 text-white">Seattle, WA (KOMO Plaza)</span>

                <span className={`${currentTheme.textDim}`}>Pronouns:</span>
                <span className="col-span-2 text-white">it/its</span>
              </div>
            </div>
          </div>
          {/* Section: Network Activities */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`${currentTheme.textDim}`}>[01]</span>
              <h2 className={`text-base font-bold uppercase tracking-wider ${currentTheme.text}`}>NETWORK ACTIVITIES & PURPOSE</h2>
            </div>
            <div className={`border ${currentTheme.border} ${currentTheme.accentBg} py-2 px-4 rounded text-xs sm:text-sm text-slate-300 space-y-2`}>
              <p>
                <span className={`${currentTheme.text} font-semibold`}>t4t.net</span> operates as an experimental autonomous system (AS395388) designed to facilitate network research & BGP routing experiments, for trans people, by trans people.
              </p>
            </div>
          </div>

          {/* Section: IP Prefixes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`${currentTheme.textDim}`}>[02]</span>
              <h2 className={`text-base font-bold uppercase tracking-wider ${currentTheme.text}`}>ADVERTISED PREFIXES</h2>
            </div>
            <div className={`border ${currentTheme.border} ${currentTheme.accentBg} pt-2 px-4 rounded overflow-x-auto`}>
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b ${currentTheme.border} opacity-80 pb-2`}>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>Prefix</th>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>Type</th>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>RIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 text-white font-semibold">23.190.72.0/24</td>
                    <td className="py-2 text-slate-400">IPv4</td>
                    <td className="py-2 text-slate-400">ARIN</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-white font-semibold">2620:c2:2000::/48</td>
                    <td className="py-2 text-slate-400">IPv6</td>
                    <td className="py-2 text-slate-400">ARIN</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: BGP Peering Sessions */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`${currentTheme.textDim}`}>[03]</span>
              <h2 className={`text-base font-bold uppercase tracking-wider ${currentTheme.text}`}>BGP PEERS</h2>
            </div>
            <div className={`border ${currentTheme.border} ${currentTheme.accentBg} pt-2 px-4 rounded overflow-x-auto`}>
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b ${currentTheme.border} opacity-80 pb-2`}>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>Peer / Description</th>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>ASN</th>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 text-white font-semibold">Cofractal</td>
                    <td className="py-2 text-slate-300 hover:underline"><a href="https://bgp.tools/as/26073">AS26073</a></td>
                    <td className="py-2 text-slate-400">Transit (IPv4 + IPv6)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Services */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`${currentTheme.textDim}`}>[04]</span>
              <h2 className={`text-base font-bold uppercase tracking-wider ${currentTheme.text}`}>SERVICES</h2>
            </div>
            <div className={`border ${currentTheme.border} ${currentTheme.accentBg} pt-2 px-4 rounded overflow-x-auto`}>
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b ${currentTheme.border} opacity-80 pb-2`}>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>Service</th>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>Description</th>
                    <th className={`pb-2 ${currentTheme.textDim} font-medium`}>URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 text-white font-semibold">Looking Glass</td>
                    <td className="py-2 text-slate-400">BGP routing information</td>
                    <td className="py-2"><a href="https://lg.t4t.net" className={`${currentTheme.text} hover:underline`}>lg.t4t.net</a></td>
                  </tr>
                  <tr>
                    <td className="py-2 text-white font-semibold">Certificate Authority</td>
                    <td className="py-2 text-slate-400">Internal PKI & TLS certificates</td>
                    <td className="py-2"><a href="https://ca.t4t.net" className={`${currentTheme.text} hover:underline`}>ca.t4t.net</a></td>
                  </tr>
                  <tr>
                    <td className="py-2 text-white font-semibold">OpenBao</td>
                    <td className="py-2 text-slate-400">Secret management</td>
                    <td className="py-2"><a href="https://bao.t4t.net:8200" className={`${currentTheme.text} hover:underline`}>bao.t4t.net</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Contact & NOC */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`${currentTheme.textDim}`}>[05]</span>
              <h2 className={`text-base font-bold uppercase tracking-wider ${currentTheme.text}`}>NETWORK OPERATIONS CENTER (NOC)</h2>
            </div>
            <div className={`border ${currentTheme.border} ${currentTheme.accentBg} py-2 px-4 rounded`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <div className="flex space-x-2">
                    <span className={`${currentTheme.textDim}`}>NOC Hours:</span>
                    <span className="text-white">9:00 AM - 5:00 PM PST</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`${currentTheme.textDim}`}>NOC Email:</span>
                    <a href="mailto:noc@t4t.net" className="text-white hover:underline">noc@t4t.net</a>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`${currentTheme.textDim}`}>Abuse Contact:</span>
                    <a href="mailto:abuse@t4t.net" className="text-white hover:underline">abuse@t4t.net</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Footer with theme toggle control */}
        <div className={`flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t ${currentTheme.border} bg-black/60 gap-3`}>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`${currentTheme.textMuted} mr-1`}>THEME:</span>
            {(['trans', 'lesbian', 'bisexual', 'nonbinary'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold transition-all duration-150 ${
                  theme === t
                    ? currentTheme.buttonActive
                    : `border-transparent ${currentTheme.textDim} ${currentTheme.buttonHover}`
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={`text-[10px] font-mono ${currentTheme.textDim}`}>
            a project by{' '}
            <a
              href="https://bsky.app/profile/catmod.ing"
              className={`${currentTheme.text} hover:underline`}
            >
              @catmod.ing
            </a>
            {' '}&amp; luna the trans puppygirl
          </div>
        </div>

      </div>
    </main>
  )
}
