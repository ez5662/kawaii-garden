import type { TimeOfDay, Weather } from '../../lib/garden'
import { blendWeight, type SkyBlend } from '../../lib/sun'
import { SKIES, type SceneColors } from '../../lib/theme'
import { Shape } from '../Shape'

const r = (a: number, b: number) => a + Math.random() * (b - a)

const STARS = Array.from({ length: 34 }, () => ({
  left: r(2, 98).toFixed(1) + '%', top: r(3, 52).toFixed(1) + '%', size: Math.round(r(2, 4)), delay: '-' + r(0, 3).toFixed(2) + 's',
}))
const RAIN = Array.from({ length: 50 }, () => ({
  left: r(0, 100).toFixed(1) + '%', delay: '-' + r(0, 1.2).toFixed(2) + 's', dur: r(0.7, 1.1).toFixed(2) + 's', h: Math.round(r(10, 18)),
}))
const SNOW = Array.from({ length: 42 }, () => ({
  left: r(0, 100).toFixed(1) + '%', delay: '-' + r(0, 8).toFixed(2) + 's', dur: r(5, 9).toFixed(2) + 's', size: Math.round(r(4, 9)),
}))
type ArcPos = { left: string; top: string }

const FENCE_POSTS = Array.from({ length: 24 }, (_, i) => (i * 4.4).toFixed(1) + '%')

function Cloud({ top, left, w, h, base, puffs, opacity, color, anim }: {
  top: number; left: string; w: number; h: number; base: number
  puffs: [number, number, number][]; opacity: number; color: string; anim: string
}) {
  return (
    <Shape s={{ top, left, width: w, height: h, opacity, animation: anim }}>
      <Shape s={{ bottom: 0, left: 0, width: w, height: base, borderRadius: 999, background: color }} />
      {puffs.map(([b, l, z], i) => <Shape key={i} s={{ bottom: b, left: l, width: z, height: z, borderRadius: '50%', background: color }} />)}
    </Shape>
  )
}

const PERIODS: TimeOfDay[] = ['morning', 'noon', 'sunset', 'night']

/** Sky gradients cross-fade between periods; stars fade in with the night. */
export function Sky({ blend, weather, sun, moon, c }: {
  blend: SkyBlend; weather: Weather; sun: ArcPos | null; moon: ArcPos | null; c: SceneColors
}) {
  const move = 'top 1.5s ease, left 1.5s ease'
  const nightAmount = blendWeight(blend, 'night')
  return (
    <>
      {/* own stacking context so the top layer's z-index stays behind the scene */}
      <Shape s={{ inset: 0, zIndex: 0 }}>
        {PERIODS.map(p => (
          <Shape key={p} s={{
            inset: 0, background: SKIES[p], transition: 'opacity 1.2s ease',
            opacity: p === blend.from ? 1 : p === blend.to ? blend.t : 0,
            zIndex: p === blend.to && blend.to !== blend.from ? 1 : 0,
          }} />
        ))}
      </Shape>

      {nightAmount > 0 && weather !== 'raining' && (
        <Shape s={{ inset: 0, opacity: nightAmount, transition: 'opacity 1.2s ease' }}>
          {STARS.map((s, i) => (
            <Shape key={i} s={{ left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: '50%', background: '#FFF6D6', boxShadow: '0 0 6px #FFF6D6', animation: `twinkle 2.6s ease-in-out ${s.delay} infinite` }} />
          ))}
        </Shape>
      )}

      {sun && weather === 'sunny' && (
        <Shape s={{ top: sun.top, left: sun.left, marginLeft: -35, width: 70, height: 70, transition: move }}>
          <div className="relative" style={{ width: 70, height: 70, borderRadius: '50%', background: c.sun, boxShadow: '0 0 0 12px rgba(255,224,122,.35), 0 0 0 26px rgba(255,224,122,.18)', animation: 'bob 5s ease-in-out infinite', transition: 'background 1.2s' }}>
            <Shape s={{ top: 28, left: 20, width: 6, height: 7, borderRadius: '50%', background: '#8A5A2B' }} />
            <Shape s={{ top: 28, right: 20, width: 6, height: 7, borderRadius: '50%', background: '#8A5A2B' }} />
            <Shape s={{ top: 38, left: 14, width: 10, height: 6, borderRadius: '50%', background: '#FFAA8A' }} />
            <Shape s={{ top: 38, right: 14, width: 10, height: 6, borderRadius: '50%', background: '#FFAA8A' }} />
          </div>
        </Shape>
      )}
      {moon && (
        <Shape s={{ top: moon.top, left: moon.left, marginLeft: -28, transition: move, width: 56, height: 56, borderRadius: '50%', boxShadow: 'inset -14px 8px 0 0 #FFF2C2', filter: 'drop-shadow(0 0 10px rgba(255,242,194,.55))', animation: 'bob 6s ease-in-out infinite' }} />
      )}

      <Cloud top={84} left="24%" w={124} h={52} base={30} puffs={[[12, 18, 44], [8, 54, 52]]} opacity={c.cloudOpacity} color={c.cloud} anim="drift 14s ease-in-out infinite alternate" />
      <Cloud top={150} left="58%" w={96} h={42} base={24} puffs={[[10, 14, 34], [6, 42, 40]]} opacity={c.cloudOpacity} color={c.cloud} anim="drift 18s ease-in-out -6s infinite alternate" />
      {weather !== 'sunny' && (
        <Cloud top={50} left="34%" w={150} h={60} base={34} puffs={[[14, 22, 52], [10, 66, 62]]} opacity={c.cloudOpacity} color={c.cloud} anim="drift 16s ease-in-out -3s infinite alternate" />
      )}
    </>
  )
}

export function Fence({ c }: { c: SceneColors }) {
  const rail = (top: number) => (
    <Shape s={{ left: 0, right: 0, top, height: 8, borderRadius: 4, background: c.fence, boxShadow: `0 2px 0 ${c.fenceShade}` }} />
  )
  return (
    <Shape s={{ left: 'calc(6% + 250px)', right: 0, bottom: 120, height: 52 }}>
      {rail(14)}
      {rail(32)}
      {FENCE_POSTS.map(left => (
        <Shape key={left} s={{ bottom: 0, left, width: 14, height: 52, borderRadius: '7px 7px 2px 2px', background: c.fence, boxShadow: `inset -3px 0 0 ${c.fenceShade}` }} />
      ))}
    </Shape>
  )
}

export function Precipitation({ weather }: { weather: Weather }) {
  if (weather === 'raining') return (
    <>
      <Shape s={{ inset: 0, background: 'rgba(90,110,145,.16)', zIndex: 8, pointerEvents: 'none' }} />
      {RAIN.map((d, i) => (
        <Shape key={i} s={{ top: -24, left: d.left, width: 2.5, height: d.h, borderRadius: 3, background: 'rgba(110,160,225,.75)', zIndex: 9, pointerEvents: 'none', animation: `rainFall ${d.dur} linear ${d.delay} infinite` }} />
      ))}
    </>
  )
  if (weather === 'snowing') return (
    <>
      {SNOW.map((f, i) => (
        <Shape key={i} s={{ top: -12, left: f.left, width: f.size, height: f.size, borderRadius: '50%', background: '#fff', boxShadow: '0 0 4px rgba(150,170,200,.6)', zIndex: 9, pointerEvents: 'none', animation: `snowFall ${f.dur} linear ${f.delay} infinite` }} />
      ))}
    </>
  )
  return null
}
