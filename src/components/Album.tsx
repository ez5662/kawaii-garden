import { AnimatePresence, motion } from 'framer-motion'
import { Droplets, X } from 'lucide-react'
import { FLOWERS, isAquatic, type Album, type FlowerType } from '../lib/garden'
import { Flower } from './Flower'
import { Shape } from './Shape'

const shortDate = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  const sameYear = y === new Date().getFullYear()
  return new Date(y, m - 1, d).toLocaleDateString([], { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })
}

/** A window with a wooden sill; the vase holds the latest harvests. */
function Windowsill({ recent }: { recent: FlowerType[] }) {
  const n = recent.length
  const pane = 'absolute rounded-[10px]'
  return (
    <div className="relative h-[230px] shrink-0 overflow-hidden rounded-[22px] bg-[#FFF3E6]">
      {/* window: frame, four panes of sky, a drifting cloud */}
      <div className="absolute top-3 right-[18%] bottom-[34px] left-[18%] rounded-[16px] bg-[#FFFDF9] p-2 shadow-[inset_0_-4px_0_#EBD6C3]">
        <div className="relative h-full w-full overflow-hidden rounded-[10px]" style={{ background: 'linear-gradient(180deg, #BFE3FF 0%, #E3F2FF 60%, #FFF0C4 100%)' }}>
          <Shape s={{ top: 22, left: '18%', width: 70, height: 26, opacity: 0.95, animation: 'drift 14s ease-in-out infinite alternate' }}>
            <Shape s={{ bottom: 0, left: 0, width: 70, height: 16, borderRadius: 999, background: '#fff' }} />
            <Shape s={{ bottom: 6, left: 10, width: 24, height: 24, borderRadius: '50%', background: '#fff' }} />
            <Shape s={{ bottom: 4, left: 30, width: 30, height: 30, borderRadius: '50%', background: '#fff' }} />
          </Shape>
          <div className={`${pane} top-0 bottom-0 left-1/2 w-2 -translate-x-1/2 rounded-none bg-[#FFFDF9]`} />
          <div className={`${pane} top-[46%] right-0 left-0 h-2 rounded-none bg-[#FFFDF9]`} />
        </div>
      </div>
      {/* curtains */}
      <div className="absolute top-0 bottom-[30px] left-[12%] w-[9%] rounded-b-[40px] bg-pink-tint shadow-[inset_-6px_0_0_rgba(247,181,198,.5)]" />
      <div className="absolute top-0 right-[12%] bottom-[30px] w-[9%] rounded-b-[40px] bg-pink-tint shadow-[inset_6px_0_0_rgba(247,181,198,.5)]" />
      <div className="absolute top-0 right-[10%] left-[10%] h-3 rounded-full bg-[#E3AE7E]" />

      {/* sill */}
      <div className="absolute right-[8%] bottom-[18px] left-[8%] h-[18px] rounded-[8px] bg-[#E3AE7E] shadow-[0_5px_0_#D19A69,inset_0_3px_0_rgba(255,255,255,.25)]" />

      {/* vase + bouquet */}
      <div className="absolute bottom-[36px] left-1/2 h-[180px] w-[220px] -translate-x-1/2">
        {recent.map((t, i) => {
          const spread = n === 1 ? 0 : -34 + (68 * i) / (n - 1)
          const lift = 50 - Math.abs(spread) * 0.3 // outer stems sit a little lower, like a real bouquet
          return (
            <Shape key={i} s={{ left: '50%', bottom: lift, width: 64, height: 120, marginLeft: -32, transformOrigin: '50% 100%', transform: `rotate(${spread}deg) scale(.82)`, animation: 'popIn .5s ease-out' }}>
              <Flower type={t} stage={2} />
            </Shape>
          )
        })}
        {/* the vase: a little kawaii jar */}
        <Shape s={{ left: '50%', bottom: 0, width: 76, height: 70, marginLeft: -38 }}>
          <Shape s={{ left: 18, top: 0, width: 40, height: 12, borderRadius: 6, background: '#A8DCC2' }} />
          <Shape s={{ left: 0, top: 8, width: 76, height: 62, borderRadius: '42% 42% 46% 46% / 40% 40% 60% 60%', background: '#BDEBD3', boxShadow: 'inset -8px -6px 0 rgba(0,0,0,.06), inset 6px 6px 0 rgba(255,255,255,.35)' }} />
          <Shape s={{ left: 25, top: 34, width: 6, height: 7, borderRadius: '50%', background: '#4A3F45' }} />
          <Shape s={{ left: 45, top: 34, width: 6, height: 7, borderRadius: '50%', background: '#4A3F45' }} />
          <Shape s={{ left: 16, top: 43, width: 10, height: 6, borderRadius: '50%', background: '#FF9DB2' }} />
          <Shape s={{ left: 50, top: 43, width: 10, height: 6, borderRadius: '50%', background: '#FF9DB2' }} />
          <Shape s={{ left: 33, top: 42, width: 8, height: 4, border: '2px solid #4A3F45', borderTop: 0, borderRadius: '0 0 6px 6px' }} />
        </Shape>
        {n === 0 && (
          <div className="absolute bottom-[84px] left-1/2 -translate-x-1/2 rounded-full bg-[rgba(255,255,255,.92)] px-3 py-1.5 font-fredoka text-[13px] font-medium whitespace-nowrap text-[#6B5A60] shadow-[0_3px_0_rgba(0,0,0,.06)]">
            harvest a bloom to fill me up
          </div>
        )}
      </div>
    </div>
  )
}

/** One scrapbook page per flower type. */
function Page({ type, count, firstAt, i }: { type: FlowerType; count: number; firstAt?: string; i: number }) {
  const f = FLOWERS.find(x => x.type === type)!
  const found = count > 0
  const tape = (side: 'left' | 'right') => (
    <span
      className="absolute -top-2 h-4 w-11 rounded-[3px]"
      style={{ [side]: -6, background: f.band, opacity: found ? 0.55 : 0.25, transform: `rotate(${side === 'left' ? -28 : 28}deg)` }}
    />
  )
  return (
    <div
      className="relative flex flex-col items-center gap-0.5 rounded-[14px] border-2 border-line bg-[#FFFDF6] px-2 pt-2 pb-3 text-center shadow-[0_3px_0_#F0E0D3]"
      style={{ transform: `rotate(${[-1.2, 0.8, -0.5, 1.1][i % 4]}deg)` }}
    >
      {tape('left')}{tape('right')}
      <div
        className="flex h-[124px] w-full items-end justify-center rounded-[10px]"
        style={{ background: found ? (type === 'snowlotus' ? 'linear-gradient(160deg,#F2F9FF,#E0F0FC)' : f.bg) : '#F7F1EC' }}
      >
        <div style={{ filter: found ? 'saturate(.9) drop-shadow(0 1px 0 rgba(0,0,0,.08))' : 'brightness(0) opacity(.12)' }}>
          <Flower type={type} stage={2} still />
        </div>
      </div>
      <span className="mt-1.5 font-fredoka text-base font-semibold" style={{ color: found ? f.ink : '#B4A6AB' }}>{f.name}</span>
      {found ? (
        <>
          <span className="text-xs font-extrabold" style={{ color: f.ink }}>×{count} harvested</span>
          {firstAt && <span className="text-[11px] font-bold text-muted-3">First pressed {shortDate(firstAt)}</span>}
        </>
      ) : (
        <span className="flex items-center gap-1 text-xs font-bold text-muted-3">
          {isAquatic(type) && <Droplets size={11} strokeWidth={2.6} />}
          {isAquatic(type) ? 'Grows in pond plots' : 'Not pressed yet'}
        </span>
      )}
    </div>
  )
}

export function AlbumModal({ open, album, onClose }: { open: boolean; album: Album; onClose: () => void }) {
  const found = FLOWERS.filter(f => album.counts[f.type]).length
  const total = Object.values(album.counts).reduce((a, n) => a + (n ?? 0), 0)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 z-[100] box-border flex items-center justify-center bg-[rgba(74,63,69,.34)] p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="album-title"
            onClick={e => e.stopPropagation()}
            className="box-border flex max-h-[calc(100vh-40px)] w-full max-w-[720px] flex-col gap-[18px] overflow-auto rounded-[32px] border-2 border-line bg-paper p-6 shadow-[0_8px_0_#F0E0D3,0_30px_60px_rgba(90,60,70,.25)]"
            initial={{ y: 16, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 id="album-title" className="m-0 font-fredoka text-[26px] font-semibold">Flower album</h2>
                <span className="text-sm font-semibold text-muted">
                  {found}/{FLOWERS.length} pressed · {total} flower{total === 1 ? '' : 's'} harvested. Snip fully bloomed flowers to fill it.
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close album"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-line bg-[#FFF9F3] text-muted hover:bg-[#FFF1E6]"
              >
                <X size={18} strokeWidth={2.8} />
              </button>
            </div>
            <Windowsill recent={album.recent} />
            <div className="grid shrink-0 gap-4 pt-1 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
              {FLOWERS.map((f, i) => (
                <Page key={f.type} type={f.type} count={album.counts[f.type] ?? 0} firstAt={album.firstAt[f.type]} i={i} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
