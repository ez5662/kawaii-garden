import type { ReactNode } from 'react'
import type { FlowerType } from '../lib/garden'
import { Shape } from './Shape'

const BUD_COLOR: Record<FlowerType, string> = {
  tulip: '#FF9DB5', daisy: '#FFF7D6', sunflower: '#FFCB3D', rose: '#E84A6E', lavender: '#B79CF0',
  poppy: '#FF8A65', lily: '#FFF2B8', lotus: '#FFB6CC', snowlotus: '#E6F4FF',
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** A tapered petal that fans out from its base (lily / lotus family). */
function FanPetal({ left, w, h, rot, from, to, round = '50% 50% 50% 50% / 90% 90% 10% 10%' }: {
  left: number; w: number; h: number; rot: number; from: string; to: string; round?: string
}) {
  return (
    <Shape s={{
      left, bottom: 0, width: w, height: h, borderRadius: round,
      background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
      transformOrigin: '50% 100%', transform: rot ? `rotate(${rot}deg)` : undefined,
    }} />
  )
}

const HEADS: Record<FlowerType, () => ReactNode> = {
  tulip: () => (
    <>
      <Shape s={{ left: -17, bottom: -6, width: 16, height: 27, borderRadius: '60% 40% 40% 60% / 70% 70% 30% 30%', background: '#FF8FAB', transform: 'rotate(-16deg)', transformOrigin: '100% 100%' }} />
      <Shape s={{ left: 1, bottom: -6, width: 16, height: 27, borderRadius: '40% 60% 60% 40% / 70% 70% 30% 30%', background: '#FF8FAB', transform: 'rotate(16deg)', transformOrigin: '0 100%' }} />
      <Shape s={{ left: -10, bottom: -8, width: 20, height: 28, borderRadius: '50% 50% 45% 45% / 72% 72% 28% 28%', background: '#FFB3C6' }} />
      <Shape s={{ left: -6, bottom: 4, width: 3, height: 4, borderRadius: '50%', background: '#4A3F45' }} />
      <Shape s={{ left: 3, bottom: 4, width: 3, height: 4, borderRadius: '50%', background: '#4A3F45' }} />
      <Shape s={{ left: -9, bottom: 0, width: 5, height: 3, borderRadius: '50%', background: '#FF7A9C' }} />
      <Shape s={{ left: 4, bottom: 0, width: 5, height: 3, borderRadius: '50%', background: '#FF7A9C' }} />
    </>
  ),
  daisy: () => (
    <>
      {range(10).map(i => (
        <Shape key={i} s={{ left: -4, bottom: -9, width: 8, height: 18, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 0 1.5px #EADFE6', transform: `rotate(${i * 36}deg) translateY(-11px)` }} />
      ))}
      <Shape s={{ left: -8, bottom: -8, width: 16, height: 16, borderRadius: '50%', background: '#FFD54F' }} />
      <Shape s={{ left: -4, bottom: 1, width: 2.5, height: 3, borderRadius: '50%', background: '#5A4030' }} />
      <Shape s={{ left: 2, bottom: 1, width: 2.5, height: 3, borderRadius: '50%', background: '#5A4030' }} />
      <Shape s={{ left: -2, bottom: -3, width: 4, height: 2, border: '1.5px solid #5A4030', borderTop: 0, borderRadius: '0 0 4px 4px' }} />
    </>
  ),
  sunflower: () => (
    <>
      {range(12).map(i => (
        <Shape key={i} s={{ left: -6, bottom: -9, width: 12, height: 18, borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%', background: '#F7B92E', transform: `rotate(${i * 30 + 15}deg) translateY(-14px)` }} />
      ))}
      {range(12).map(i => (
        <Shape key={i} s={{ left: -5.5, bottom: -8, width: 11, height: 16, borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%', background: '#FFD45C', transform: `rotate(${i * 30}deg) translateY(-12px)` }} />
      ))}
      <Shape s={{ left: -11, bottom: -11, width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle at 50% 38%, #B5824F 0%, #9A6A40 70%)', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.08)' }} />
      <Shape s={{ left: -4.5, bottom: 1, width: 3, height: 4, borderRadius: '50%', background: '#3E2A20' }} />
      <Shape s={{ left: 1.5, bottom: 1, width: 3, height: 4, borderRadius: '50%', background: '#3E2A20' }} />
      <Shape s={{ left: -2, bottom: -3, width: 4, height: 2, border: '1.5px solid #3E2A20', borderTop: 0, borderRadius: '0 0 4px 4px' }} />
      <Shape s={{ left: -9, bottom: -2, width: 5, height: 3, borderRadius: '50%', background: '#FF9DB2' }} />
      <Shape s={{ left: 4, bottom: -2, width: 5, height: 3, borderRadius: '50%', background: '#FF9DB2' }} />
    </>
  ),
  rose: () => (
    <>
      <Shape s={{ left: -16, bottom: -10, width: 14, height: 7, borderRadius: '0 100% 0 100%', background: '#5DB27F', transform: 'rotate(-25deg)' }} />
      <Shape s={{ left: 2, bottom: -10, width: 14, height: 7, borderRadius: '100% 0 100% 0', background: '#5DB27F', transform: 'rotate(25deg)' }} />
      <Shape s={{ left: -15, bottom: -8, width: 30, height: 26, borderRadius: '40% 40% 50% 50% / 30% 30% 70% 70%', background: '#D93A5E' }} />
      <Shape s={{ left: -13, bottom: 10, width: 26, height: 12, borderRadius: '50%', background: '#B82A4D' }} />
      <Shape s={{ left: -9, bottom: 12, width: 18, height: 8, borderRadius: '50%', background: '#9E2042' }} />
      <Shape s={{ left: -5, bottom: 13, width: 10, height: 5, borderRadius: '50%', border: '2px solid #E8506F', borderBottomColor: 'transparent', boxSizing: 'border-box' }} />
      <Shape s={{ left: -15, bottom: -8, width: 17, height: 22, borderRadius: '20% 60% 50% 60% / 30% 50% 60% 70%', background: '#F05A7C', transform: 'rotate(-6deg)' }} />
      <Shape s={{ left: -2, bottom: -8, width: 17, height: 22, borderRadius: '60% 20% 60% 50% / 50% 30% 70% 60%', background: '#E84A6E', transform: 'rotate(6deg)' }} />
      <Shape s={{ left: -8, bottom: -9, width: 16, height: 16, borderRadius: '30% 30% 50% 50% / 20% 20% 80% 80%', background: '#FF7593' }} />
      <Shape s={{ left: -6, bottom: 4, width: 12, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.35)' }} />
    </>
  ),
  lily: () => {
    const r = '50% 50% 50% 50% / 85% 85% 15% 15%'
    return (
      <>
        <FanPetal left={-5} w={10} h={30} rot={-62} from="#FFF6C8" to="#F5E08A" round={r} />
        <FanPetal left={-5} w={10} h={30} rot={62} from="#F5E08A" to="#F5E08A" round={r} />
        <FanPetal left={-5} w={10} h={32} rot={-30} from="#FFF9DA" to="#F7E59A" round={r} />
        <FanPetal left={-5} w={10} h={32} rot={30} from="#F7E59A" to="#F7E59A" round={r} />
        <FanPetal left={-5} w={10} h={30} rot={0} from="#FFFBE6" to="#F7E59A" round={r} />
        <Shape s={{ left: -1, bottom: 6, width: 2, height: 18, borderRadius: 1, background: '#E7C65A' }} />
        <Shape s={{ left: -3, bottom: 2, width: 1.5, height: 24, background: '#9ACF7A', transformOrigin: '50% 100%', transform: 'rotate(-14deg)' }} />
        <Shape s={{ left: 1, bottom: 2, width: 1.5, height: 24, background: '#9ACF7A', transformOrigin: '50% 100%', transform: 'rotate(14deg)' }} />
        <Shape s={{ left: -1, bottom: 2, width: 1.5, height: 27, background: '#9ACF7A' }} />
        <Shape s={{ left: -10, bottom: 24, width: 5, height: 7, borderRadius: '50%', background: '#F29A3C', transform: 'rotate(-14deg)' }} />
        <Shape s={{ left: 5, bottom: 24, width: 5, height: 7, borderRadius: '50%', background: '#F29A3C', transform: 'rotate(14deg)' }} />
        <Shape s={{ left: -2.5, bottom: 28, width: 5, height: 7, borderRadius: '50%', background: '#F29A3C' }} />
        <Shape s={{ left: -7, bottom: -6, width: 14, height: 10, borderRadius: '50% 50% 40% 40%', background: '#B9DC8A' }} />
      </>
    )
  },
  lotus: () => (
    <>
      <Shape s={{ left: -24, bottom: -14, width: 48, height: 14, borderRadius: '50%', background: '#7FCB93', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.08)' }} />
      <FanPetal left={-6} w={12} h={22} rot={-70} from="#FFE6EE" to="#FF9DBA" />
      <FanPetal left={-6} w={12} h={22} rot={70} from="#FF9DBA" to="#FF9DBA" />
      <FanPetal left={-6.5} w={13} h={27} rot={-42} from="#FFF0F5" to="#FF8FB0" />
      <FanPetal left={-6.5} w={13} h={27} rot={42} from="#FF8FB0" to="#FF8FB0" />
      <FanPetal left={-6.5} w={13} h={30} rot={-16} from="#FFF4F8" to="#FFA6C2" />
      <FanPetal left={-6.5} w={13} h={30} rot={16} from="#FFA6C2" to="#FFA6C2" />
      <FanPetal left={-6} w={12} h={28} rot={0} from="#FFF8FB" to="#FFB6CC" />
      <Shape s={{ left: -10, bottom: -4, width: 20, height: 8, borderRadius: '50%', background: '#FFD54F', boxShadow: 'inset 0 -2px 0 #F2B33D' }} />
      <Shape s={{ left: -17, bottom: -6, width: 14, height: 12, borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%', background: '#FFC2D3', transform: 'rotate(-58deg)' }} />
      <Shape s={{ left: 3, bottom: -6, width: 14, height: 12, borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%', background: '#FFC2D3', transform: 'rotate(58deg)' }} />
    </>
  ),
  snowlotus: () => (
    <>
      <Shape s={{ left: -22, bottom: -14, width: 44, height: 44, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(190,225,255,.65), rgba(190,225,255,0))', animation: 'fglow 2.8s ease-in-out infinite' }} />
      <FanPetal left={-5.5} w={11} h={24} rot={-66} from="#FFFFFF" to="#BFE0FA" />
      <FanPetal left={-5.5} w={11} h={24} rot={66} from="#BFE0FA" to="#BFE0FA" />
      <FanPetal left={-6} w={12} h={29} rot={-36} from="#FFFFFF" to="#A9D4F5" />
      <FanPetal left={-6} w={12} h={29} rot={36} from="#A9D4F5" to="#A9D4F5" />
      <FanPetal left={-6} w={12} h={31} rot={0} from="#FFFFFF" to="#CDE7FB" />
      <Shape s={{ left: -5, bottom: 2, width: 10, height: 10, borderRadius: '50%', background: '#E6F4FF', boxShadow: '0 0 0 2px #B5DCF7' }} />
      <Shape s={{ left: -16, bottom: -7, width: 13, height: 12, borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%', background: '#DDEFFC', transform: 'rotate(-60deg)' }} />
      <Shape s={{ left: 3, bottom: -7, width: 13, height: 12, borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%', background: '#DDEFFC', transform: 'rotate(60deg)' }} />
      {([[-22, 20, 6, '0s'], [17, 30, 5, '-.7s'], [12, 4, 4, '-1.3s'], [-3, 40, 4, '-.3s']] as const).map(([l, b, z, d], i) => (
        <Shape key={i} s={{ left: l, bottom: b, width: z, height: z, background: '#FFFFFF', boxShadow: '0 0 6px #A9D4F5', transform: 'rotate(45deg)', animation: `ftwinkle 2s ease-in-out ${d} infinite` }} />
      ))}
    </>
  ),
  lavender: () => (
    <>
      {([[-7, -6, 9, 11, '#A487E8'], [-1, 0, 9, 11, '#B79CF0'], [-8, 7, 9, 11, '#B79CF0'], [-1, 13, 9, 11, '#A487E8'],
        [-7, 20, 8, 10, '#A487E8'], [-1, 26, 8, 10, '#C7B2F5'], [-5, 33, 8, 10, '#B79CF0'], [-3, 40, 6, 8, '#D3C2F8']] as const).map(([l, b, w, h, c], i) => (
        <Shape key={i} s={{ left: l, bottom: b, width: w, height: h, borderRadius: '50%', background: c }} />
      ))}
    </>
  ),
  poppy: () => (
    <>
      {[45, 135, 225, 315].map((deg, i) => (
        <Shape key={deg} s={{ left: -11, bottom: -11, width: 22, height: 22, borderRadius: '50% 50% 45% 45%', background: i % 2 ? '#FF7A59' : '#FF8A65', transform: `rotate(${deg}deg) translateY(-9px)` }} />
      ))}
      <Shape s={{ left: -5, bottom: -5, width: 10, height: 10, borderRadius: '50%', background: '#4A3F45', boxShadow: '0 0 0 2.5px #FFCF6B' }} />
    </>
  ),
}

/** Kawaii flower, 64×120. Stage 0 sprout · 1 bud · 2 bloom. `still` turns off the sway (pressed flowers). */
export function Flower({ type, stage, still }: { type: FlowerType; stage: number; still?: boolean }) {
  const st = Math.max(0, Math.min(2, stage))
  const stemH = st === 0 ? 16 : st === 1 ? 54 : type === 'sunflower' ? 76 : type === 'lavender' ? 58 : 64
  return (
    <div className="relative" style={{ width: 64, height: 120 }}>
      <div className="absolute inset-0" style={{ transformOrigin: '50% 100%', animation: still ? undefined : 'fsway 3.6s ease-in-out infinite' }}>
        <Shape s={{ bottom: 0, left: 30, width: 4, height: stemH, borderRadius: 3, background: '#6CC08F' }} />
        {st === 0 ? (
          <>
            <Shape s={{ bottom: 10, left: 16, width: 15, height: 9, borderRadius: '0 100% 0 100%', background: '#94DDB0' }} />
            <Shape s={{ bottom: 12, left: 33, width: 14, height: 8, borderRadius: '100% 0 100% 0', background: '#7FD3A0' }} />
          </>
        ) : (
          <>
            <Shape s={{ bottom: 16, left: 8, width: 23, height: 12, borderRadius: '0 100% 0 100%', background: '#94DDB0' }} />
            <Shape s={{ bottom: 28, left: 33, width: 22, height: 11, borderRadius: '100% 0 100% 0', background: '#7FD3A0' }} />
          </>
        )}
        <Shape s={{ left: 32, bottom: stemH, width: 0, height: 0 }}>
          {st === 1 && (
            <>
              <Shape s={{ left: -8, bottom: -10, width: 16, height: 8, borderRadius: '0 0 50% 50%', background: '#7FD3A0' }} />
              <Shape s={{ left: -7, bottom: -4, width: 14, height: 20, borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%', background: BUD_COLOR[type], boxShadow: 'inset -3px -2px 0 rgba(0,0,0,.06)' }} />
            </>
          )}
          {st === 2 && HEADS[type]()}
        </Shape>
      </div>
    </div>
  )
}
