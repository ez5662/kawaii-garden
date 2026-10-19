import { AnimatePresence, motion } from 'framer-motion'
import {
  Check, ChevronDown, Cloud, CloudRain, Droplets, Heart, Loader2, LocateFixed, MapPin, Moon, Shovel, Snowflake,
  Scissors, Sparkles, Sprout, Sun, Sunrise, Sunset, type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TimeOfDay, Weather } from '../../lib/garden'
import type { Toast as ToastData, ToastType } from '../../lib/useGarden'
import type { Sky } from '../../lib/useSky'

const WEATHER_META: Record<Weather, [string, LucideIcon]> = {
  sunny: ['Sunny', Sun], cloudy: ['Cloudy', Cloud], raining: ['Raining', CloudRain], snowing: ['Snowing', Snowflake],
}
const TOD_META: Record<TimeOfDay, [string, LucideIcon]> = {
  morning: ['Morning', Sunrise], noon: ['Noon', Sun], sunset: ['Sunset', Sunset], night: ['Night', Moon],
}
const chip = 'flex h-[38px] items-center gap-2 rounded-full font-fredoka text-sm font-medium text-ink shadow-[0_3px_0_rgba(0,0,0,.06)]'
const sectionLabel = 'px-2.5 pt-1.5 pb-1 text-[11px] font-extrabold tracking-[.8px] text-muted-3 uppercase'
const menuItem = 'flex h-10 cursor-pointer items-center gap-2.5 rounded-[14px] border-0 px-2.5 text-left font-fredoka text-[15px] font-medium text-ink hover:bg-[#FFF1E6]'

const clockTime = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

function minutesAgo(ms: number, now: Date) {
  const m = Math.max(0, Math.round((now.getTime() - ms) / 60_000))
  return m < 1 ? 'just now' : `${m} min ago`
}

function liveDetail(sky: Sky) {
  if (sky.status === 'locating') return 'Asking for your location…'
  if (sky.status === 'loading') return 'Checking the sky…'
  if (sky.error) return sky.error
  if (sky.report) return `Updated ${minutesAgo(sky.report.fetchedAt, sky.now)} · Open-Meteo`
  return 'Uses your location to match the real weather.'
}

/** Time-of-day chip (left) and weather menu (right): live weather or a simulated one. */
export function SceneTopBar({ sky, onManual, onLive }: {
  sky: Sky; onManual: (w: Weather) => void; onLive: () => void
}) {
  const [open, setOpen] = useState(false)
  const [city, setCity] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const [todLabel, TodIcon] = TOD_META[sky.tod]
  const [wLabel, WIcon] = WEATHER_META[sky.weather]
  const showingLive = sky.live && !!sky.report
  const busy = sky.status === 'locating' || sky.status === 'loading'

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const submitCity = (e: FormEvent) => {
    e.preventDefault()
    if (!city.trim()) return
    onLive()
    sky.searchCity(city)
    setCity('')
  }

  return (
    <div className="absolute top-3.5 right-3.5 left-3.5 z-20 flex items-start justify-between gap-2.5">
      <div
        className={`${chip} bg-[rgba(255,253,249,.92)] pr-3.5 pl-2.5`}
        title={sky.sunTimes && sky.report
          ? `Sunrise ${clockTime(new Date(sky.report.sunrise * 1000))} · Sunset ${clockTime(new Date(sky.report.sunset * 1000))}`
          : undefined}
      >
        <span className="flex text-[#E99A3C]"><TodIcon size={16} strokeWidth={2.6} /></span>
        {todLabel} · {clockTime(sky.clock)}
      </div>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`${chip} cursor-pointer border-0 bg-[rgba(255,253,249,.95)] pr-3 pl-2.5`}
        >
          <span className="flex text-[#5C9BD6]"><WIcon size={16} strokeWidth={2.6} /></span>
          {wLabel}
          {showingLive && <span className="text-muted">· {sky.temp}</span>}
          {showingLive && <span aria-label="live" className="h-2 w-2 rounded-full bg-mint-strong shadow-[0_0_0_3px_#D5F3E4]" />}
          <span className="flex text-muted-2"><ChevronDown size={16} strokeWidth={2.4} /></span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              role="menu"
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute top-[46px] right-0 box-content flex w-[236px] max-w-[calc(100vw-80px)] flex-col gap-0.5 rounded-[20px] border-2 border-line bg-paper p-1.5 shadow-[0_6px_0_#F0E0D3,0_16px_30px_rgba(120,90,80,.18)]"
            >
              <div className="flex items-center justify-between pr-1.5">
                <div className={sectionLabel}>Live weather</div>
                <div role="radiogroup" aria-label="Temperature unit" className="flex rounded-full bg-[#F3EAE3] p-0.5">
                  {(['C', 'F'] as const).map(u => (
                    <button
                      key={u}
                      role="radio"
                      aria-checked={sky.unit === u}
                      onClick={() => sky.setUnit(u)}
                      className={`h-6 w-8 cursor-pointer rounded-full border-0 font-fredoka text-xs font-semibold transition-colors ${sky.unit === u ? 'bg-paper text-ink shadow-[0_1px_0_rgba(0,0,0,.08)]' : 'bg-transparent text-muted-2 hover:text-ink'}`}
                    >
                      °{u}
                    </button>
                  ))}
                </div>
              </div>
              <button
                role="menuitemradio"
                aria-checked={sky.live}
                onClick={onLive}
                className={`${menuItem} ${sky.live ? 'bg-[#EAF4FD]' : 'bg-transparent'}`}
              >
                <span className="flex text-[#5C9BD6]"><MapPin size={17} strokeWidth={2.6} /></span>
                <span className="min-w-0 truncate">{sky.place ? sky.place.name : 'Live weather'}</span>
                {sky.live && <span className="ml-auto flex text-mint-strong"><Check size={16} strokeWidth={3} /></span>}
              </button>
              <div
                className={`px-2.5 pb-1 text-xs font-semibold ${sky.error ? 'text-pink-ink' : 'text-muted-2'}`}
                aria-live="polite"
              >
                {liveDetail(sky)}
              </div>
              <form onSubmit={submitCity} className="flex gap-1.5 px-1 pb-1">
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Type a city…"
                  aria-label="City for live weather"
                  className="box-border h-8 min-w-0 flex-1 rounded-full border-2 border-line bg-[#FFF9F3] px-3 font-nunito text-[13px] font-semibold text-ink outline-none focus:border-pink"
                />
                <button
                  type="button"
                  onClick={() => { onLive(); sky.locate() }}
                  disabled={busy}
                  title="Use my location"
                  aria-label="Use my location"
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#EAF4FD] text-[#5C9BD6] disabled:opacity-50"
                >
                  {busy ? <Loader2 size={15} strokeWidth={2.8} className="animate-spin" /> : <LocateFixed size={15} strokeWidth={2.6} />}
                </button>
              </form>

              <div className="mx-2 my-1 border-t-2 border-dashed border-line" />
              <div className={sectionLabel}>Simulate weather</div>
              {(Object.keys(WEATHER_META) as Weather[]).map(k => {
                const [label, Icon] = WEATHER_META[k]
                const on = !sky.live && k === sky.weather
                return (
                  <button
                    key={k}
                    role="menuitemradio"
                    aria-checked={on}
                    onClick={() => { onManual(k); setOpen(false) }}
                    className={`${menuItem} ${on ? 'bg-[#EAF4FD]' : 'bg-transparent'}`}
                  >
                    <span className="flex text-[#5C9BD6]"><Icon size={17} strokeWidth={2.6} /></span>
                    {label}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const TOAST_META: Record<ToastType, [string, LucideIcon]> = {
  water: ['#7CBFEA', Droplets], fertilize: ['#F2B33D', Sparkles], weed: ['#8DBF5C', Shovel],
  bonus: ['#F07A9A', Heart], plant: ['#6CC896', Sprout], harvest: ['#B79CF0', Scissors],
}

export function Toast({ toast }: { toast: ToastData }) {
  const [bg, Icon] = TOAST_META[toast.type]
  return (
    <div
      role="status"
      className="absolute top-[66px] left-1/2 z-[21] flex items-center gap-2.5 whitespace-nowrap rounded-full bg-paper py-2 pr-[18px] pl-2 shadow-[0_4px_0_rgba(0,0,0,.07),0_10px_24px_rgba(90,60,70,.16)]"
      style={{ animation: 'toastIn 2.8s ease-out forwards' }}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: bg }}>
        <Icon size={18} strokeWidth={2.6} />
      </span>
      <div className="flex flex-col">
        <span className="font-fredoka text-[15px] leading-[1.15] font-semibold">{toast.title}</span>
        <span className="text-[12.5px] font-semibold text-subtle">{toast.sub}</span>
      </div>
    </div>
  )
}
