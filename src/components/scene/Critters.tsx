import { Heart, Sparkles } from 'lucide-react'
import type { EffectType } from '../../lib/useGarden'
import { Shape } from '../Shape'

/** Streak > 3: a little bird perches on the fence. */
export function Bird() {
  return (
    <Shape s={{ left: 'calc(50% + 150px)', bottom: 168, width: 38, height: 32, zIndex: 4, animation: 'popIn .6s ease-out' }}>
      <Shape s={{ inset: 0, animation: 'hop 2.6s ease-in-out .4s infinite' }}>
        <Shape s={{ bottom: 0, left: 0, width: 36, height: 30, borderRadius: '50%', background: '#FFE08A' }} />
        <Shape s={{ bottom: 6, left: 4, width: 16, height: 12, borderRadius: '50%', background: '#F7C95C' }} />
        <Shape s={{ top: 8, right: 9, width: 5, height: 6, borderRadius: '50%', background: '#3E3238' }} />
        <Shape s={{ top: 12, right: -3, width: 8, height: 8, background: '#F49A5B', transform: 'rotate(45deg)', borderRadius: 2 }} />
        <Shape s={{ top: 16, right: 5, width: 7, height: 4, borderRadius: '50%', background: '#FF9DB2' }} />
        <Shape s={{ top: -4, left: 16, width: 6, height: 8, borderRadius: '50% 50% 0 50%', background: '#F7C95C', transform: 'rotate(20deg)' }} />
      </Shape>
    </Shape>
  )
}

/** Streak > 6: a frog joins in. */
export function Frog() {
  const eye = (side: 'left' | 'right', pupilLeft: number) => (
    <Shape s={{ top: -6, [side]: 4, width: 20, height: 20, borderRadius: '50%', background: '#9EDB8F' }}>
      <Shape s={{ top: 4, left: 4, width: 12, height: 12, borderRadius: '50%', background: '#fff' }}>
        <Shape s={{ top: 3, left: pupilLeft, width: 6, height: 6, borderRadius: '50%', background: '#3E3238' }} />
      </Shape>
    </Shape>
  )
  return (
    <Shape s={{ left: 'calc(50% - 130px)', bottom: 12, width: 60, height: 46, zIndex: 6, animation: 'popIn .6s ease-out' }}>
      <Shape s={{ inset: 0, animation: 'hop 3.2s ease-in-out infinite' }}>
        {eye('left', 4)}
        {eye('right', 3)}
        <Shape s={{ bottom: 0, left: 0, width: 60, height: 40, borderRadius: '50% 50% 44% 44%', background: '#9EDB8F' }} />
        <Shape s={{ bottom: 16, left: 8, width: 10, height: 6, borderRadius: '50%', background: '#FF9DB2' }} />
        <Shape s={{ bottom: 16, right: 8, width: 10, height: 6, borderRadius: '50%', background: '#FF9DB2' }} />
        <Shape s={{ bottom: 16, left: 24, width: 12, height: 6, border: '2.5px solid #3E3238', borderTop: 0, borderRadius: '0 0 10px 10px' }} />
      </Shape>
    </Shape>
  )
}

const SPARKLES = ([[-90, 60, 0], [70, 64, 0.15], [-60, 110, 0.3], [50, 120, 0.1], [-110, 92, 0.45], [86, 98, 0.35], [-14, 50, 0.25]] as const)
  .map(([x, b, d]) => ({ left: `calc(50% + ${x}px)`, bottom: b, delay: d + 's' }))
const WATER_DROPS = [-34, -20, -6, 8, -27, -13].map((x, i) => ({ left: `calc(50% + ${x}px)`, delay: (0.75 + i * 0.12).toFixed(2) + 's' }))
const HEARTS = [-50, -10, 30, 60, -30].map((x, i) => ({ left: `calc(50% + ${x}px)`, delay: (i * 0.18).toFixed(2) + 's' }))

/** Chore 3: a weed pops out with a smoke puff. Rendered behind the tree. */
export function WeedEffect() {
  const puff = (l: number, b: number, z: number, bg: string, d: string) => (
    <Shape s={{ left: l, bottom: b, width: z, height: z, borderRadius: '50%', background: bg, animation: `puff 2.6s ease-out ${d} forwards` }} />
  )
  return (
    <Shape s={{ left: 'calc(50% + 80px)', bottom: 24, width: 44, height: 52, zIndex: 5 }}>
      <Shape s={{ inset: 0, animation: 'weedPop 2.6s ease-out forwards' }}>
        <Shape s={{ bottom: 0, left: 20, width: 4, height: 34, borderRadius: 3, background: '#6E9F4E' }} />
        <Shape s={{ bottom: 18, left: 2, width: 20, height: 11, borderRadius: '0 100% 0 100%', background: '#93BC5C' }} />
        <Shape s={{ bottom: 24, left: 23, width: 18, height: 10, borderRadius: '100% 0 100% 0', background: '#93BC5C' }} />
        <Shape s={{ bottom: 30, left: 16, width: 12, height: 12, borderRadius: '50%', background: '#C7D96B' }} />
      </Shape>
      {puff(0, 20, 28, '#fff', '0s')}
      {puff(20, 34, 32, '#F4F1F8', '.05s')}
      {puff(-14, 40, 22, '#fff', '.1s')}
      {puff(26, 8, 22, '#F4F1F8', '.08s')}
      {puff(6, 56, 18, '#fff', '.14s')}
    </Shape>
  )
}

/** Chore 2: golden glow at the roots (behind the tree). */
export function FertilizeGlow() {
  return (
    <Shape s={{ left: '50%', bottom: 50, width: 220, marginLeft: -110, height: 44, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,226,120,.85), rgba(255,226,120,0))', animation: 'glow 2.6s ease-out forwards', zIndex: 3 }} />
  )
}

/** Foreground effects layered above the tree. */
export function ForegroundEffect({ effect }: { effect: EffectType }) {
  if (effect === 'fertilize') return (
    <>
      {SPARKLES.map((sp, i) => (
        <Shape key={i} s={{ left: sp.left, bottom: sp.bottom, color: '#F2B33D', zIndex: 6, opacity: 0, animation: `sparkle 1.1s ease-out ${sp.delay} 2 both` }}>
          <Sparkles size={22} strokeWidth={2.2} />
        </Shape>
      ))}
    </>
  )
  if (effect === 'water') return (
    <>
      <Shape s={{ top: 140, left: 'calc(50% + 26px)', width: 120, height: 84, zIndex: 7, transformOrigin: '30% 60%', animation: 'canTip 2.6s ease-in-out forwards' }}>
        <Shape s={{ left: -6, top: 30, width: 46, height: 11, borderRadius: 6, background: '#A8D8F8', border: '3px solid #7CBFEA', transform: 'rotate(28deg)', transformOrigin: 'right center' }} />
        <Shape s={{ left: -12, top: 4, width: 16, height: 20, borderRadius: '6px 6px 4px 4px', background: '#7CBFEA', transform: 'rotate(-62deg)' }} />
        <Shape s={{ right: -4, top: 10, width: 30, height: 36, border: '6px solid #7CBFEA', borderRadius: '50%' }} />
        <Shape s={{ left: 34, top: 20, width: 72, height: 54, borderRadius: 18, background: '#A8D8F8', border: '3px solid #7CBFEA' }} />
        <Shape s={{ left: 52, top: 12, width: 34, height: 10, borderRadius: 6, background: '#7CBFEA' }} />
        <Shape s={{ left: 56, top: 42, width: 6, height: 7, borderRadius: '50%', background: '#3E3238' }} />
        <Shape s={{ left: 80, top: 42, width: 6, height: 7, borderRadius: '50%', background: '#3E3238' }} />
        <Shape s={{ left: 50, top: 52, width: 9, height: 5, borderRadius: '50%', background: '#FF9DB2' }} />
        <Shape s={{ left: 82, top: 52, width: 9, height: 5, borderRadius: '50%', background: '#FF9DB2' }} />
      </Shape>
      {WATER_DROPS.map((w, i) => (
        <Shape key={i} s={{ top: 240, left: w.left, width: 8, height: 12, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#7CBFEA', zIndex: 6, animation: `dropFall .7s ease-in ${w.delay} 3 both` }} />
      ))}
    </>
  )
  if (effect === 'bonus') return (
    <>
      {HEARTS.map((h, i) => (
        <Shape key={i} s={{ left: h.left, bottom: 220, color: '#F07A9A', zIndex: 6, animation: `heartUp 1.8s ease-out ${h.delay} both` }}>
          <Heart size={20} strokeWidth={2.6} />
        </Shape>
      ))}
    </>
  )
  return null
}
