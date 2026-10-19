import { motion } from 'framer-motion'
import { RefreshCw, Scissors, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { flowerMeta, flowerStage, type FlowerSpot, type Planting } from '../../lib/garden'
import { spotAnchor } from './spots'

/** Small card above a planted flower: harvest it (when bloomed) or swap its seed. */
export function FlowerCard({ spot, planting, done, onHarvest, onSwap, onClose }: {
  spot: FlowerSpot; planting: Planting; done: number
  onHarvest: () => void; onSwap: () => void; onClose: () => void
}) {
  const anchor = spotAnchor(spot)
  const f = flowerMeta(planting.type)
  const stage = flowerStage(done, planting.at)
  const toBloom = Math.max(0, 3 - (done - planting.at))
  const status = stage === 2 ? 'In full bloom — ready to harvest'
    : `${stage === 1 ? 'Budding' : 'Sprouting'} · blooms in ${toBloom} task${toBloom === 1 ? '' : 's'}`

  // Close on a click elsewhere (flowers and plot chips handle their own clicks) or Escape.
  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (!(e.target as Element).closest('[data-flower-card], [data-flower-hit]')) onClose()
    }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [onClose])

  return (
    <motion.div
      data-flower-card
      role="dialog"
      aria-label={`${f.name} options`}
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
      className="absolute z-[15] flex w-[220px] flex-col gap-2 rounded-[18px] border-2 border-line bg-paper p-2.5 shadow-[0_5px_0_#F0E0D3,0_14px_28px_rgba(120,90,80,.2)]"
      style={{ left: `clamp(118px, ${anchor.left}, calc(100% - 118px))`, bottom: anchor.bottom + 10, x: '-50%', transformOrigin: '50% 100%' }}
    >
      <div className="flex items-center gap-2 px-1">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: f.band, boxShadow: `0 0 0 3px ${f.bg}` }} />
        <span className="font-fredoka text-[15px] font-semibold" style={{ color: f.ink }}>{f.name}</span>
        {stage === 2 && <span className="ml-auto flex text-[#F2B33D]"><Sparkles size={14} strokeWidth={2.6} /></span>}
      </div>
      <span className="px-1 text-xs font-bold text-subtle">{status}</span>
      <div className="flex gap-1.5">
        {stage === 2 && (
          <button
            onClick={onHarvest}
            autoFocus
            className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 bg-pink font-fredoka text-[13px] font-semibold text-white shadow-[0_3px_0_#E67E99] transition-transform hover:-translate-y-px active:translate-y-0.5 active:shadow-[0_1px_0_#E67E99]"
          >
            <Scissors size={14} strokeWidth={2.6} />Harvest
          </button>
        )}
        <button
          onClick={onSwap}
          autoFocus={stage !== 2}
          className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 border-line bg-[#FFF9F3] font-fredoka text-[13px] font-semibold text-muted hover:bg-[#FFF1E6]"
        >
          <RefreshCw size={13} strokeWidth={2.6} />Swap seed
        </button>
      </div>
      {/* little tail pointing at the flower */}
      <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-line bg-paper" />
    </motion.div>
  )
}
