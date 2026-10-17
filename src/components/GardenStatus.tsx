import { Check, Droplets, Flame, Flower, Flower2, Lock, Plus, Shovel, Sparkles, type LucideIcon } from 'lucide-react'
import { BED_LEVEL, SCENE_PLOTS, flowerMeta, type PlotTarget } from '../lib/garden'
import type { ReactNode } from 'react'
import type { Garden } from '../lib/useGarden'

const label = 'text-[11px] font-extrabold tracking-[.8px] text-muted-3 uppercase'

const RITUALS: [string, LucideIcon, string][] = [
  ['Water', Droplets, '#7CBFEA'],
  ['Fertilize', Sparkles, '#F2B33D'],
  ['Weed', Shovel, '#8DBF5C'],
]

interface Chip {
  key: string
  bg: string
  border: string
  dashed: boolean
  color: string
  icon: ReactNode
  title: string
  onClick?: () => void
}

const lockedChip = (key: string, title: string): Chip =>
  ({ key, bg: '#FBF6F2', border: '#E6D7CB', dashed: true, color: '#9C8C92', icon: <Lock size={13} strokeWidth={2.6} />, title })

function plotChips(g: Garden, onPlant: (t: PlotTarget) => void): Chip[] {
  const chips: (Chip & { lv: number })[] = SCENE_PLOTS.map(p => {
    const pl = g.plots[p.lv]
    const key = 'plot-' + p.lv
    if (pl) {
      const f = flowerMeta(pl.type)
      return { lv: p.lv, key, bg: f.bg, border: f.band, dashed: false, color: f.ink, icon: <Flower2 size={15} strokeWidth={2.6} />, title: f.name }
    }
    if (g.level >= p.lv) {
      return { lv: p.lv, key, bg: '#FFE0E8', border: '#F7A9BC', dashed: false, color: '#A0385A', icon: <Plus size={14} strokeWidth={3} />, title: 'Plant a seed', onClick: () => onPlant(p.lv) }
    }
    return { lv: p.lv, ...lockedChip(key, 'Lv ' + p.lv) }
  })
  const canPlantBed = g.bed.length < g.bedCap
  chips.push({
    lv: BED_LEVEL,
    ...(g.bedOpen
      ? { key: 'bed', bg: '#FFEBD6', border: '#E3AE7E', dashed: false, color: '#8A5F3A', icon: <Flower size={15} strokeWidth={2.6} />, title: `Flower bed ${g.bed.length}/${g.bedCap}`, onClick: canPlantBed ? () => onPlant('bed') : undefined }
      : lockedChip('bed', `Bed · Lv ${BED_LEVEL}`)),
  })
  return chips.sort((a, b) => a.lv - b.lv)
}

/** Stage progress, today's chores, plot chips and companion hint below the scene. */
export function GardenStatus({ g, onPlant }: { g: Garden; onPlant: (t: PlotTarget) => void }) {
  const unlocked = SCENE_PLOTS.filter(p => g.level >= p.lv || g.plots[p.lv]).length + (g.bedOpen ? 1 : 0)
  const nextUnlock = [2, 3, 4, 5, 6, 7].find(lv => lv > g.level)
  const left = g.tasksToNextLevel
  const levelHint = nextUnlock
    ? `${unlocked}/6 unlocked · next plot at level ${nextUnlock} (${left} task${left > 1 ? 's' : ''} to level ${g.level + 1})`
    : `${unlocked}/6 plots unlocked`
  const s = g.streak
  const companionHint = s > 6 ? `${s}-day streak — a bird and a frog are visiting!`
    : s > 3 ? `${s}-day streak — a little bird is visiting. A frog joins at 7 days.`
      : `Keep a streak above 3 days and a little bird will visit (${s}/4).`

  return (
    <div className="flex flex-col gap-[18px] px-3 pt-3.5 pb-2.5">
      <div className="flex flex-wrap items-end justify-between gap-[18px]">
        <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-fredoka text-[22px] font-semibold">{g.stageName}</span>
            <span className="text-[13px] font-bold text-muted-2">Stage {g.stageIndex + 1} of 5 · {g.chores} chores tended</span>
          </div>
          <div
            className="h-3 overflow-hidden rounded-full bg-[#F3EAE3]"
            role="progressbar" aria-label="Tree growth" aria-valuenow={g.stagePct} aria-valuemin={0} aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-mint" style={{ width: g.stagePct + '%', transition: 'width .6s cubic-bezier(.3,1.4,.5,1)' }} />
          </div>
          <span className="text-[13.5px] font-semibold text-subtle">{g.stageHint}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className={label}>Today's chores · {Math.min(3, g.todayCount)}/3</span>
          <div className="flex flex-wrap gap-2">
            {RITUALS.map(([name, Icon, c], i) => {
              const ok = g.todayCount > i
              return (
                <div
                  key={name}
                  className="box-content flex h-9 items-center gap-[7px] rounded-full border-2 pr-[13px] pl-2 font-fredoka text-sm font-medium transition-all duration-300"
                  style={{ background: ok ? '#FFFDF9' : '#FBF6F2', borderColor: ok ? c : '#E6D7CB', borderStyle: ok ? 'solid' : 'dashed', color: ok ? '#4A3F45' : '#A8969C' }}
                >
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-white" style={{ background: ok ? c : '#D8CAC0' }}>
                    {ok ? <Check size={13} strokeWidth={3} /> : <Icon size={13} strokeWidth={2.6} />}
                  </span>
                  {name}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2.5">
          <span className={label}>Garden plots</span>
          <span className="text-[13px] font-semibold text-muted-2">{levelHint}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {plotChips(g, onPlant).map(p => (
            <button
              key={p.key}
              onClick={p.onClick}
              disabled={!p.onClick}
              className={`flex h-8 items-center gap-1.5 rounded-full border-2 pr-3 pl-2 font-fredoka text-[13px] font-semibold ${p.onClick ? 'cursor-pointer' : ''}`}
              style={{ background: p.bg, borderColor: p.border, borderStyle: p.dashed ? 'dashed' : 'solid', color: p.color }}
            >
              <span className="flex">{p.icon}</span>{p.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-subtle">
          <span className="flex text-[#F2A65A]"><Flame size={14} strokeWidth={2.6} /></span>{companionHint}
        </div>
      </div>
    </div>
  )
}
