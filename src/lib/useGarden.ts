import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BED_LEVEL, BED_MAX, BLOSSOM_SPOTS, CHORES_PER_BLOSSOM, EMPTY_ALBUM, FLOWERS, STAGE_NAMES, STAGE_THRESHOLDS, TASKS_PER_LEVEL, VASE_SIZE,
  blossomCount, choreSum, dayKey, flowerMeta, flowerStage, levelFor, loadGarden, saveGarden, stageIdx,
  type FlowerSpot, type FlowerType, type Planting, type PlotTarget, type SavedGarden, type TestingProps, type Weather,
} from './garden'

export type EffectType = 'water' | 'fertilize' | 'weed' | 'bonus' | 'harvest'
export type ToastType = EffectType | 'plant'
export interface Toast {
  title: string
  sub: string
  type: ToastType
}
/** `key` changes on every fire so CSS animations restart. */
export interface Fx {
  effect: EffectType
  toast: Toast
  key: number
  /** Harvest only: which flower floats up, and from where in the scene. */
  flower?: FlowerType
  at?: { left: string; bottom: number }
}

const FX_MS = 2800

type ChoreEffect = Exclude<EffectType, 'harvest'>
const MSGS: Record<ChoreEffect, [string, string]> = {
  water: ['Watered!', 'Chore 1 today — a big refreshing drink'],
  fertilize: ['Fertilized!', 'Chore 2 — the roots are sparkling'],
  weed: ['Weeded!', 'Chore 3 — the tree is fully tended today'],
  bonus: ['Extra love!', 'Your flowers love the attention'],
}

const days = (n: number) => {
  const d = Math.ceil(n / 3)
  return `${d} day${d === 1 ? '' : 's'}`
}

export function useGarden(testing: TestingProps) {
  const [garden, setGarden] = useState<SavedGarden>(loadGarden)
  const [fx, setFx] = useState<Fx | null>(null)
  const fxTimer = useRef<number | undefined>(undefined)

  useEffect(() => saveGarden(garden), [garden])
  useEffect(() => () => window.clearTimeout(fxTimer.current), [])

  const fire = useCallback((effect: EffectType, toast: Toast, extra?: Pick<Fx, 'flower' | 'at'>) => {
    window.clearTimeout(fxTimer.current)
    setFx({ effect, toast, key: Date.now(), ...extra })
    fxTimer.current = window.setTimeout(() => setFx(null), FX_MS)
  }, [])

  const { tasks, log, streak: savedStreak, plots, bed, weather, weatherLive } = garden
  const sim = testing.simulateDays

  // ---- actions ----
  const complete = (id: number) => {
    const t = tasks.find(x => x.id === id)
    if (!t || t.status !== 'todo') return
    const today = dayKey()
    const cnt = (log[today] || 0) + 1
    const newLog = { ...log, [today]: cnt }
    let st = savedStreak
    if (st.last !== today) st = { count: st.last === dayKey(-1) ? st.count + 1 : 1, last: today }
    setGarden(g => ({
      ...g,
      tasks: g.tasks.map(x => (x.id === id ? { ...x, status: 'done', doneAt: today } : x)),
      log: newLog,
      streak: st,
    }))

    const type: ChoreEffect = cnt <= 3 ? (['water', 'fertilize', 'weed'] as const)[cnt - 1] : 'bonus'
    const before = choreSum(log, sim), after = choreSum(newLog, sim)
    const a = stageIdx(before), b = stageIdx(after)
    let sub = MSGS[type][1]
    if (b > a) sub = `It grew into a ${STAGE_NAMES[b].toLowerCase()}!`
    else if (blossomCount(after) > blossomCount(before)) sub = 'A new blossom opened on the tree!'
    fire(type, { title: MSGS[type][0], sub, type })
  }

  const undo = (id: number) => {
    const today = dayKey()
    setGarden(g => {
      let lg = g.log
      const ts = g.tasks.map(x => {
        if (x.id !== id || x.status === 'todo') return x
        if (x.status === 'done' && x.doneAt === today && lg[today]) lg = { ...lg, [today]: Math.max(0, lg[today] - 1) }
        return { ...x, status: 'todo' as const, doneAt: null }
      })
      return { ...g, tasks: ts, log: lg }
    })
  }

  const drop = (id: number) =>
    setGarden(g => ({ ...g, tasks: g.tasks.map(x => (x.id === id && x.status === 'todo' ? { ...x, status: 'dropped' } : x)) }))

  /** Delete a task outright. Returns what's needed to undo the deletion. */
  const remove = (id: number) => {
    const index = tasks.findIndex(x => x.id === id)
    if (index < 0) return null
    const task = tasks[index]
    const day = dayKey()
    // A task completed today also counted as one of today's chores.
    const countedToday = task.status === 'done' && task.doneAt === day && (log[day] || 0) > 0
    setGarden(g => ({
      ...g,
      tasks: g.tasks.filter(x => x.id !== id),
      log: countedToday ? { ...g.log, [day]: Math.max(0, (g.log[day] || 0) - 1) } : g.log,
    }))
    return { task, index, countedToday, day }
  }
  const unremove = (r: NonNullable<ReturnType<typeof remove>>) =>
    setGarden(g => {
      const ts = [...g.tasks]
      ts.splice(Math.min(r.index, ts.length), 0, r.task)
      return { ...g, tasks: ts, log: r.countedToday ? { ...g.log, [r.day]: (g.log[r.day] || 0) + 1 } : g.log }
    })

  const add = (text: string) => {
    const t = text.trim()
    if (!t) return false
    setGarden(g => ({ ...g, tasks: [{ id: Date.now(), text: t, status: 'todo' }, ...g.tasks] }))
    return true
  }

  const done = tasks.filter(t => t.status === 'done').length

  /** Plant a seed. Planting where a flower already grows swaps it for the new seed. */
  const plant = (target: PlotTarget, type: FlowerType) => {
    const p: Planting = { type, at: done }
    if (target === 'bed') setGarden(g => ({ ...g, bed: [...g.bed, p] }))
    else if (typeof target === 'number') setGarden(g => ({ ...g, plots: { ...g.plots, [target]: p } }))
    else setGarden(g => ({ ...g, bed: g.bed.map((b, k) => (k === target.bedSlot ? p : b)) }))
    fire('bonus', { title: `Planted a ${flowerMeta(type).name.toLowerCase()}!`, sub: 'Finish 3 tasks to see it bloom', type: 'plant' })
  }

  const plantingAt = (spot: FlowerSpot): Planting | undefined =>
    typeof spot === 'number' ? plots[spot] : bed[spot.bedSlot]

  /** Snip a fully bloomed flower into the album; it regrows from a sprout in the same spot. */
  const harvest = (spot: FlowerSpot, at?: Fx['at']) => {
    const pl = plantingAt(spot)
    if (!pl || flowerStage(done, pl.at) < 2) return
    const t = pl.type, day = dayKey()
    const firstTime = !garden.album.counts[t]
    const count = (garden.album.counts[t] || 0) + 1
    const regrown: Planting = { type: t, at: done }
    setGarden(g => ({
      ...g,
      plots: typeof spot === 'number' ? { ...g.plots, [spot]: regrown } : g.plots,
      bed: typeof spot === 'number' ? g.bed : g.bed.map((b, k) => (k === spot.bedSlot ? regrown : b)),
      album: {
        counts: { ...g.album.counts, [t]: (g.album.counts[t] || 0) + 1 },
        firstAt: { ...g.album.firstAt, [t]: g.album.firstAt[t] ?? day },
        recent: [t, ...g.album.recent].slice(0, VASE_SIZE),
      },
    }))
    const name = flowerMeta(t).name
    const discovered = Object.keys(garden.album.counts).length + (firstTime ? 1 : 0)
    fire('harvest', firstTime
      ? { title: `New album page: ${name}!`, sub: `Pressed into your flower album · ${discovered}/${FLOWERS.length} found`, type: 'harvest' }
      : { title: `Harvested a ${name.toLowerCase()}!`, sub: `${count} in your album · it regrows after 3 tasks`, type: 'harvest' },
    { flower: t, at })
  }

  /** Pick a simulated weather (turns live weather off). */
  const setWeather = (w: Weather) => setGarden(g => ({ ...g, weather: w, weatherLive: false }))
  const setWeatherLive = () => setGarden(g => ({ ...g, weatherLive: true }))

  const clearFx = () => {
    window.clearTimeout(fxTimer.current)
    setFx(null)
  }
  const reset = () => {
    clearFx()
    setGarden(g => ({ ...g, tasks: [], log: {}, plots: {}, bed: [], streak: { count: 0, last: null }, album: EMPTY_ALBUM }))
  }
  /** Replace everything with an imported backup. */
  const restore = (g: SavedGarden) => {
    clearFx()
    setGarden(g)
  }

  // ---- derived ----
  const today = dayKey(), yday = dayKey(-1)

  const total = tasks.length
  const dropped = tasks.filter(t => t.status === 'dropped').length
  const effective = total - dropped
  const open = total - done - dropped
  const rate = total ? done / total : 0
  const eff = effective ? done / effective : 0

  const realStreak = savedStreak.last === today || savedStreak.last === yday ? savedStreak.count : 0
  const streak = testing.streakOverride > 0 ? testing.streakOverride : realStreak
  const todayCount = log[today] || 0

  const chores = choreSum(log, sim)
  const si = stageIdx(chores)
  const nBloom = blossomCount(chores)
  let stagePct: number, stageHint: string
  if (si === 4) {
    const maxed = nBloom >= BLOSSOM_SPOTS.length
    const into = (chores - STAGE_THRESHOLDS[4]) % CHORES_PER_BLOSSOM, need = CHORES_PER_BLOSSOM - into
    stagePct = maxed ? 100 : Math.round((into / CHORES_PER_BLOSSOM) * 100)
    stageHint = maxed
      ? `Mature · ${nBloom} blossoms — in full glory`
      : `Mature · ${nBloom} blossoms · next blossom in ${need} chores (~${days(need)})`
  } else {
    const span = STAGE_THRESHOLDS[si + 1] - STAGE_THRESHOLDS[si], into = chores - STAGE_THRESHOLDS[si], need = span - into
    stagePct = Math.round((into / span) * 100)
    stageHint = `${into}/${span} chores · about ${days(need)} of full chores until ${STAGE_NAMES[si + 1]}`
  }

  const level = levelFor(done)
  const bedCap = level >= BED_LEVEL ? Math.min(BED_MAX, level - BED_LEVEL + 1) : 0
  const bedOpen = bedCap > 0 || bed.length > 0
  const tasksToNextLevel = TASKS_PER_LEVEL - (done % TASKS_PER_LEVEL)

  return {
    // raw state
    garden, tasks, plots, bed, album: garden.album, manualWeather: weather, weatherLive, fx,
    // derived
    streak, level, done, total, dropped, effective, open, rate, eff,
    todayCount, chores, stageIndex: si, stageName: STAGE_NAMES[si], stagePct, stageHint, nBloom,
    bedCap, bedOpen, tasksToNextLevel,
    // actions
    complete, undo, drop, remove, unremove, add, plant, harvest, plantingAt, setWeather, setWeatherLive, reset, restore,
  }
}

export type Garden = ReturnType<typeof useGarden>
