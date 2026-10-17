import type { CSSProperties } from 'react'
import type { SceneColors } from '../../lib/theme'
import { Shape } from '../Shape'

const ROCK_SHADOW = 'inset -10px -8px 0 rgba(0,0,0,.07), inset 8px 8px 0 rgba(255,255,255,.18)'
const PEBBLE_SHADOW = 'inset -6px -5px 0 rgba(0,0,0,.07)'

const oval = (left: number, bottom: number, width: number, height: number, background: string, extra?: CSSProperties): CSSProperties =>
  ({ left, bottom, width, height, borderRadius: '50%', background, ...extra })

/** Animated stripe gradient for falling water. */
const fallStyle = (c: SceneColors, speed: string): CSSProperties => ({
  backgroundImage: `linear-gradient(180deg, ${c.waterA} 0%, ${c.waterA} 58%, ${c.waterB} 58%, ${c.waterB} 76%, ${c.waterA} 76%)`,
  backgroundSize: '100% 44px',
  animation: `flow ${speed} linear infinite`,
})

/**
 * Hill, bushes, rock wall and a three-pool waterfall. 260px wide group,
 * positioned at left 6% of the scene. Back → front order matters.
 */
export function Waterfall({ c }: { c: SceneColors }) {
  const moss = (l: number, b: number, w: number, h: number, extra?: CSSProperties) => <Shape s={oval(l, b, w, h, c.moss, extra)} />
  const mossDrip = (l: number, b: number, w: number, h: number, r = '50% 50% 50% 50% / 30% 30% 70% 70%') =>
    <Shape s={{ left: l, bottom: b, width: w, height: h, borderRadius: r, background: c.moss }} />
  const leaf = (l: number, b: number, w: number, h: number, flip: boolean, rot: number) =>
    <Shape s={{ left: l, bottom: b, width: w, height: h, borderRadius: flip ? '100% 0 100% 0' : '0 100% 0 100%', background: '#7FC48E', transform: `rotate(${rot}deg)` }} />
  const bloom = (l: number, b: number, z: number, color: string) =>
    <Shape s={{ left: l, bottom: b, width: z, height: z, borderRadius: '50%', background: color, boxShadow: '0 0 0 2px #fff' }} />
  const fade = { transition: 'background 1.2s' }

  return (
    <div className="absolute top-0 bottom-0" style={{ left: '6%', width: 260 }}>
      {/* grassy hill + bushes */}
      <Shape s={{ left: -60, bottom: 56, width: 360, height: 130, borderRadius: '50% 50% 20% 20% / 70% 70% 30% 30%', background: c.ground1, ...fade }} />
      <Shape s={oval(-44, 136, 116, 116, c.bushA)} />
      <Shape s={oval(26, 244, 80, 80, c.bushB)} />
      <Shape s={oval(130, 136, 96, 96, c.bushA)} />
      <Shape s={oval(172, 146, 62, 62, c.bushB)} />

      {/* back rock wall + boulders */}
      <Shape s={{ left: -40, bottom: 104, width: 240, height: 210, borderRadius: '46% 54% 30% 30% / 58% 62% 30% 30%', background: c.rockWall, boxShadow: 'inset -14px -10px 0 rgba(0,0,0,.08), inset 10px 10px 0 rgba(255,255,255,.12)' }} />
      <Shape s={oval(4, 196, 64, 44, c.rockB, { boxShadow: PEBBLE_SHADOW })} />
      <Shape s={oval(120, 186, 66, 46, c.rockA, { boxShadow: PEBBLE_SHADOW })} />
      <Shape s={oval(-24, 150, 70, 56, c.rockA, { boxShadow: PEBBLE_SHADOW })} />
      <Shape s={oval(150, 138, 60, 48, c.rockC, { boxShadow: PEBBLE_SHADOW })} />
      {moss(16, 236, 40, 12)}
      {moss(132, 226, 40, 11)}
      {moss(-10, 200, 34, 10)}
      {moss(160, 180, 32, 10)}
      {leaf(40, 180, 22, 9, false, -30)}
      {leaf(118, 172, 22, 9, true, 30)}
      {bloom(24, 214, 8, '#FFE07A')}
      {bloom(170, 198, 8, '#FFB3C7')}
      <Shape s={{ left: -36, bottom: 212, width: 132, height: 112, borderRadius: '50% 50% 42% 48% / 60% 55% 45% 40%', background: c.rockB, boxShadow: 'inset -10px -8px 0 rgba(0,0,0,.07), inset 8px 8px 0 rgba(255,255,255,.18)' }} />
      <Shape s={{ left: 100, bottom: 206, width: 90, height: 86, borderRadius: '55% 45% 50% 50% / 60% 60% 40% 40%', background: c.rockA, boxShadow: ROCK_SHADOW }} />
      {moss(-6, 302, 78, 22)}
      {moss(114, 278, 50, 15)}
      <Shape s={{ left: 112, bottom: 270, width: 52, height: 36, borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%', background: c.rockA, boxShadow: 'inset -8px -6px 0 rgba(0,0,0,.07), inset 6px 6px 0 rgba(255,255,255,.18)' }} />
      {moss(128, 300, 26, 8)}

      {/* top reservoir pool */}
      <Shape s={oval(24, 284, 132, 40, c.rockC, { boxShadow: 'inset 0 -8px 0 rgba(0,0,0,.08)' })} />
      <Shape s={oval(34, 296, 112, 24, c.pool, { boxShadow: 'inset 0 4px 0 rgba(0,0,0,.08)' })} />
      <Shape s={oval(56, 302, 40, 8, 'rgba(255,255,255,.55)')} />
      <Shape s={{ left: 66, bottom: 300, width: 52, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.8)', animation: 'ripple 2.4s ease-out infinite' }} />
      <Shape s={oval(116, 304, 16, 7, '#8CCB7E')} />
      {moss(20, 310, 30, 10)}
      <Shape s={{ left: 76, bottom: 290, width: 32, height: 12, borderRadius: '50% 50% 40% 40%', background: c.waterA }} />

      {/* upper fall */}
      <Shape s={{ left: 80, bottom: 198, width: 24, height: 98, borderRadius: '12px 12px 4px 4px', ...fallStyle(c, '.8s') }}>
        <Shape s={{ top: 8, bottom: 8, left: 5, width: 2.5, borderRadius: 2, background: 'rgba(255,255,255,.7)' }} />
      </Shape>
      <Shape s={oval(82, 292, 20, 5, 'rgba(255,255,255,.85)')} />

      {/* mid pool */}
      <Shape s={{ left: 118, bottom: 136, width: 96, height: 72, borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%', background: c.rockA, boxShadow: ROCK_SHADOW }} />
      {moss(150, 196, 40, 11)}
      <Shape s={{ left: 24, bottom: 158, width: 136, height: 54, borderRadius: '45% 55% 40% 40% / 60% 60% 40% 40%', background: c.rockC, boxShadow: ROCK_SHADOW }} />
      <Shape s={oval(58, 194, 68, 15, c.pool)} />
      {moss(30, 192, 26, 10)}
      {moss(128, 194, 26, 10)}

      {/* lower fall */}
      <Shape s={{ left: 74, bottom: 112, width: 34, height: 92, borderRadius: '10px 10px 4px 4px', ...fallStyle(c, '.7s') }}>
        <Shape s={{ top: 8, bottom: 10, left: 6, width: 3, borderRadius: 2, background: 'rgba(255,255,255,.7)' }} />
        <Shape s={{ top: 20, bottom: 16, right: 7, width: 2, borderRadius: 2, background: 'rgba(255,255,255,.5)' }} />
      </Shape>
      <Shape s={{ left: -26, bottom: 98, width: 100, height: 78, borderRadius: '48% 52% 45% 50% / 60% 58% 42% 40%', background: c.rockA, boxShadow: ROCK_SHADOW }} />
      <Shape s={{ left: 112, bottom: 96, width: 80, height: 58, borderRadius: '52% 48% 45% 50% / 62% 60% 40% 38%', background: c.rockB, boxShadow: ROCK_SHADOW }} />
      {moss(-8, 162, 62, 16)}
      {moss(126, 144, 42, 12)}
      {moss(166, 200, 40, 11)}
      {mossDrip(192, 182, 14, 16)}
      {moss(156, 272, 32, 11, { transform: 'rotate(36deg)' })}
      {mossDrip(178, 258, 9, 11, '50% 50% 50% 50% / 35% 35% 65% 65%')}
      {moss(158, 142, 30, 9)}
      {mossDrip(178, 124, 12, 14)}
      {leaf(194, 206, 20, 8, true, 30)}
      {bloom(176, 208, 7, '#FFE07A')}

      {/* large lower pool */}
      <Shape s={oval(-36, 66, 290, 62, c.pool, { boxShadow: 'inset 0 -6px 0 rgba(255,255,255,.35), inset 0 8px 0 rgba(0,0,0,.06)' })} />
      <Shape s={{ left: 51, bottom: 94, width: 80, height: 22, borderRadius: '50%', border: '2px solid rgba(255,255,255,.85)', animation: 'ripple 1.8s ease-out infinite' }} />
      <Shape s={{ left: 51, bottom: 94, width: 80, height: 22, borderRadius: '50%', border: '2px solid rgba(255,255,255,.85)', animation: 'ripple 1.8s ease-out -.9s infinite' }} />
      {/* foam */}
      <Shape s={oval(68, 106, 16, 16, '#fff', { opacity: 0.9, animation: 'bob 1.2s ease-in-out infinite' })} />
      <Shape s={oval(82, 110, 20, 20, '#fff', { opacity: 0.9, animation: 'bob 1.4s ease-in-out -.4s infinite' })} />
      <Shape s={oval(98, 105, 14, 14, '#fff', { opacity: 0.9, animation: 'bob 1.1s ease-in-out -.2s infinite' })} />
      {/* lily pad + ferns */}
      <Shape s={oval(122, 74, 30, 12, '#8CCB7E')} />
      {bloom(132, 80, 9, '#FFB3C7')}
      {leaf(-34, 88, 26, 10, false, -35)}
      {leaf(226, 86, 26, 10, true, 35)}
    </div>
  )
}
