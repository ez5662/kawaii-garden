import { Lock, Plus } from 'lucide-react'
import { BED_LEVEL, BED_MAX, SCENE_PLOTS, flowerStage, type Planting, type PlotTarget } from '../../lib/garden'
import { Flower } from '../Flower'
import { Shape } from '../Shape'

const lockPill = 'absolute left-1/2 -translate-x-1/2 flex items-center whitespace-nowrap rounded-full font-fredoka font-semibold'

interface PlotsProps {
  plots: Record<number, Planting>
  level: number
  done: number
  night: boolean
  pool: string
  onPlant: (t: PlotTarget) => void
}

/** Soil plots and pond plots in the scene, keyed by unlock level. */
export function ScenePlots({ plots, level, done, night, pool, onPlant }: PlotsProps) {
  return (
    <>
      {SCENE_PLOTS.map(p => {
        const pl = plots[p.lv]
        const unlocked = level >= p.lv || !!pl
        const water = !!p.water
        const base = water ? (night ? '#5F77B4' : '#9ED6F5') : '#A97C62'
        return (
          <Shape key={p.lv} s={{ left: p.left, bottom: p.bottom, width: 64, height: 126, marginLeft: -32, zIndex: 2 }}>
            {pl ? (
              <>
                {water && (
                  <>
                    <Shape s={{ bottom: -6, left: -6, width: 76, height: 22, borderRadius: '50%', background: pool, boxShadow: 'inset 0 -4px 0 rgba(255,255,255,.35)' }} />
                    <Shape s={{ bottom: -2, left: 8, width: 48, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,.8)', animation: 'ripple 2.2s ease-out infinite' }} />
                  </>
                )}
                <Shape s={{ bottom: 0, left: 8, width: 48, height: 14, borderRadius: '50%', background: base, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.08)' }} />
                <Shape s={{ bottom: 6, left: 0, width: 64, height: 120, transformOrigin: '50% 100%', animation: 'popIn .7s ease-out' }}>
                  <Flower type={pl.type} stage={flowerStage(done, pl.at)} />
                </Shape>
              </>
            ) : unlocked ? (
              <>
                <Shape s={{ bottom: -4, left: water ? -6 : 6, width: water ? 76 : 52, height: water ? 22 : 16, borderRadius: '50%', background: base, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.08)' }} />
                <div className="absolute flex justify-center" style={{ bottom: 22, left: -10, right: -10 }}>
                  <button
                    onClick={() => onPlant(p.lv)}
                    aria-label={water ? `Plant in pond plot (level ${p.lv})` : `Plant in soil plot (level ${p.lv})`}
                    className="flex h-7 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border-0 bg-pink pr-[11px] pl-2 font-fredoka text-[12.5px] font-semibold text-white shadow-[0_3px_0_#E67E99]"
                    style={{ animation: 'bob 2s ease-in-out infinite' }}
                  >
                    <Plus size={12} strokeWidth={3.2} />Plant
                  </button>
                </div>
              </>
            ) : (
              <>
                <Shape s={{
                  bottom: 4, left: 6, width: 52, height: 18, borderRadius: '50%', boxSizing: 'border-box',
                  background: water ? 'rgba(110,170,220,.25)' : 'rgba(150,105,80,.22)',
                  border: `2px dashed ${water ? 'rgba(90,150,210,.55)' : 'rgba(150,105,80,.5)'}`,
                }} />
                <div className={`${lockPill} bottom-7 h-6 gap-[3px] bg-[rgba(255,253,249,.92)] px-2 text-[11.5px] text-subtle shadow-[0_2px_0_rgba(0,0,0,.06)]`}>
                  <Lock size={11} strokeWidth={2.8} />Lv {p.lv}
                </div>
              </>
            )}
          </Shape>
        )
      })}
    </>
  )
}

/** Wooden planter on the right: 1 slot at Lv6, +1 per level, max 5. */
export function FlowerBed({ bed, bedCap, bedOpen, done, onPlant }: {
  bed: Planting[]; bedCap: number; bedOpen: boolean; done: number; onPlant: (t: PlotTarget) => void
}) {
  return (
    <Shape s={{ right: '3%', bottom: 52, width: 226, height: 150, zIndex: 2 }}>
      {!bedOpen ? (
        <>
          <Shape s={{ left: 0, right: 0, bottom: 4, height: 34, borderRadius: '12px 12px 16px 16px', border: '2px dashed rgba(150,105,80,.5)', background: 'rgba(150,105,80,.14)', boxSizing: 'border-box' }} />
          <div className={`${lockPill} bottom-[46px] h-[26px] gap-1 bg-[rgba(255,253,249,.92)] px-2.5 text-xs text-subtle shadow-[0_2px_0_rgba(0,0,0,.06)]`}>
            <Lock size={11} strokeWidth={2.8} />Flower bed · Lv {BED_LEVEL}
          </div>
        </>
      ) : (
        <>
          <Shape s={{ left: 8, right: 8, bottom: 26, height: 16, borderRadius: '50%', background: '#A97C62' }} />
          <div className="absolute flex items-end justify-between" style={{ left: 14, right: 14, bottom: 30, height: 120 }}>
            {Array.from({ length: BED_MAX }, (_, k) => {
              const b = bed[k]
              const firstEmpty = k === bed.length
              const empty = !b && k < bedCap && firstEmpty
              const locked = !b && !empty && k >= Math.max(bedCap, bed.length)
              return (
                <div key={k} className="relative" style={{ width: 38, height: 120 }}>
                  {b && (
                    <Shape s={{ bottom: -4, left: -13, width: 64, height: 120, transform: 'scale(.82)', transformOrigin: '50% 100%', animation: 'popIn .7s ease-out' }}>
                      <Flower type={b.type} stage={flowerStage(done, b.at)} />
                    </Shape>
                  )}
                  {empty && (
                    <button
                      onClick={() => onPlant('bed')}
                      aria-label="Plant in flower bed"
                      className="absolute flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-pink p-0 text-white shadow-[0_3px_0_#E67E99]"
                      style={{ bottom: 6, left: 5, animation: `bob 2s ease-in-out -${(k * 0.3).toFixed(1)}s infinite` }}
                    >
                      <Plus size={12} strokeWidth={3.2} />
                    </button>
                  )}
                  {locked && (
                    <div className={`${lockPill} bottom-2 h-5 gap-0.5 bg-[rgba(255,253,249,.85)] px-1.5 text-[10.5px] text-muted-2`}>
                      <Lock size={11} strokeWidth={2.8} />Lv {BED_LEVEL + k}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Shape s={{
            left: 0, right: 0, bottom: 0, height: 36, borderRadius: '10px 10px 16px 16px', backgroundColor: '#E3AE7E',
            boxShadow: 'inset 0 -6px 0 rgba(0,0,0,.08), 0 3px 0 rgba(120,80,50,.18)',
            backgroundImage: 'linear-gradient(90deg, transparent 0, transparent 74px, rgba(120,80,50,.18) 74px, rgba(120,80,50,.18) 76px, transparent 76px, transparent 150px, rgba(120,80,50,.18) 150px, rgba(120,80,50,.18) 152px, transparent 152px)',
          }} />
          <Shape s={{ left: -4, right: -4, bottom: 30, height: 9, borderRadius: 6, background: '#D19A69' }} />
          <div className={`${lockPill} bottom-[7px] h-[22px] gap-1.5 bg-[#FFF6EA] px-2.5 text-[11.5px] text-[#8A5F3A]`}>
            <span className="rounded-full bg-ink" style={{ width: 4, height: 5 }} />
            Flower bed · {bed.length}/{BED_MAX}
            <span className="rounded-full bg-ink" style={{ width: 4, height: 5 }} />
          </div>
        </>
      )}
    </Shape>
  )
}
