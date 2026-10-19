import { AnimatePresence, motion } from 'framer-motion'
import { Droplets, Shovel, X } from 'lucide-react'
import { FLOWERS, flowerMeta, isAquatic, type FlowerType, type PlotTarget } from '../lib/garden'
import { Flower } from './Flower'

const isPond = (t: PlotTarget | null) => t === 5 || t === 7

/** Seed packet modal. Pond plots take lotuses only; soil plots and the bed take the rest. */
export function SeedPicker({ target, swapping, onPick, onClose }: {
  target: PlotTarget | null
  /** The flower being replaced, when swapping a seed. */
  swapping?: FlowerType
  onPick: (t: FlowerType) => void; onClose: () => void
}) {
  const pond = isPond(target)
  const msg = swapping
    ? `Swap your ${flowerMeta(swapping).name.toLowerCase()} for a new seed — it starts again as a sprout.${pond ? ' Only lotuses float here.' : ''}`
    : pond ? 'This is a pond plot — only lotuses can float here.'
      : target === 'bed' ? 'Add a flower to your bed. Mix and match as you like!' : 'This soil plot is ready. What should bloom here?'

  return (
    <AnimatePresence>
      {target != null && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 z-[100] box-border flex items-center justify-center bg-[rgba(74,63,69,.34)] p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="seed-title"
            onClick={e => e.stopPropagation()}
            className="box-border flex max-h-[calc(100vh-40px)] w-full max-w-[700px] flex-col gap-[18px] overflow-auto rounded-[32px] border-2 border-line bg-paper p-6 shadow-[0_8px_0_#F0E0D3,0_30px_60px_rgba(90,60,70,.25)]"
            initial={{ y: 16, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 id="seed-title" className="m-0 font-fredoka text-[26px] font-semibold">{swapping ? 'Swap seed packet' : 'Pick a seed packet'}</h2>
                <span className="text-sm font-semibold text-muted">{msg}</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-line bg-[#FFF9F3] text-muted hover:bg-[#FFF1E6]"
              >
                <X size={18} strokeWidth={2.8} />
              </button>
            </div>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
              {FLOWERS.map(f => {
                const aq = isAquatic(f.type)
                const ok = aq === pond
                return (
                  <button
                    key={f.type}
                    onClick={() => ok && onPick(f.type)}
                    disabled={!ok}
                    aria-label={`${f.name} — ${f.desc}${ok ? '' : ' (not for this plot)'}`}
                    className={`flex flex-col items-stretch gap-0.5 overflow-hidden rounded-[12px_12px_20px_20px] border-0 p-0 pb-3.5 text-center transition-transform duration-[180ms] ${ok ? 'cursor-pointer hover:-translate-y-1 hover:-rotate-[1.5deg]' : 'cursor-not-allowed opacity-45 grayscale-[.6]'}`}
                    style={{ background: f.bg, boxShadow: `0 5px 0 ${f.band}` }}
                  >
                    <div style={{ height: 18, background: `radial-gradient(circle at 6px 100%, ${f.bg} 4px, transparent 4.5px) 0 0 / 12px 100% repeat-x, ${f.band}` }} />
                    <div
                      className="mx-3 mt-2.5 mb-1.5 box-border flex h-[136px] items-end justify-center rounded-[14px] border-2 border-dashed bg-paper pb-1.5"
                      style={{ borderColor: f.band }}
                    >
                      <Flower type={f.type} stage={2} />
                    </div>
                    <span className="font-fredoka text-lg font-semibold" style={{ color: f.ink }}>{f.name}</span>
                    <span className="text-xs font-bold" style={{ color: f.ink }}>{f.desc}</span>
                    <span className="mt-1 flex items-center justify-center gap-1 text-[11px] font-extrabold" style={{ color: f.ink }}>
                      {aq ? <Droplets size={12} strokeWidth={2.6} /> : <Shovel size={12} strokeWidth={2.6} />}
                      {aq ? 'Pond plots only' : 'Soil plots'}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
