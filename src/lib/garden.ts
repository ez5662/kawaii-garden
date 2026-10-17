export type TaskStatus = 'todo' | 'done' | 'dropped'
export interface Task {
  id: number
  text: string
  status: TaskStatus
  doneAt?: string | null
}

export type FlowerType =
  | 'tulip' | 'daisy' | 'sunflower' | 'rose' | 'lavender' | 'poppy' | 'lily' | 'lotus' | 'snowlotus'

/** A planted flower. `at` = done-task count at plant time (growth = done − at). */
export interface Planting {
  type: FlowerType
  at: number
}

export type Weather = 'sunny' | 'cloudy' | 'raining' | 'snowing'
export const WEATHERS: Weather[] = ['sunny', 'cloudy', 'raining', 'snowing']
export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'night'
export interface Streak {
  count: number
  last: string | null
}

/** A soil/pond plot is keyed by its unlock level; the flower bed is 'bed'. */
export type PlotTarget = number | 'bed'

export interface SavedGarden {
  tasks: Task[]
  streak: Streak
  log: Record<string, number>
  plots: Record<number, Planting>
  bed: Planting[]
  /** Manually simulated weather; used when live weather is off or unavailable. */
  weather: Weather
  weatherLive: boolean
}

export const STORAGE_KEY = 'kawaii-garden-v1'

export interface FlowerMeta {
  type: FlowerType
  name: string
  desc: string
  bg: string
  band: string
  ink: string
}

export const FLOWERS: FlowerMeta[] = [
  { type: 'tulip', name: 'Tulip', desc: 'Sweet spring cups', bg: '#FFE3EA', band: '#F7A9BC', ink: '#A0385A' },
  { type: 'daisy', name: 'Daisy', desc: 'Sunny little smiles', bg: '#EAF6DE', band: '#B5DB98', ink: '#3F7A2A' },
  { type: 'sunflower', name: 'Sunflower', desc: 'Tall & cheerful', bg: '#FFF0B8', band: '#F2CF62', ink: '#7A5600' },
  { type: 'rose', name: 'Rose', desc: 'Velvety classic bloom', bg: '#FFDDE2', band: '#F59AAA', ink: '#9E3049' },
  { type: 'lavender', name: 'Lavender', desc: 'Calm, cozy scent', bg: '#ECE4FF', band: '#C3B0F2', ink: '#5E44A8' },
  { type: 'poppy', name: 'Poppy', desc: 'Bold paper petals', bg: '#FFE2D4', band: '#F7AE8F', ink: '#9E4025' },
  { type: 'lily', name: 'Lily', desc: 'Soft yellow church lilies', bg: '#FFF8D6', band: '#EED97A', ink: '#7A6200' },
  { type: 'lotus', name: 'Water lotus', desc: 'Floats on the pond', bg: '#FFE8F0', band: '#F2A9C2', ink: '#9A3A62' },
  { type: 'snowlotus', name: 'Snow lotus', desc: 'Frosty & magical', bg: '#E6F3FD', band: '#A9D4F5', ink: '#2F6A99' },
]
export const flowerMeta = (t: FlowerType) => FLOWERS.find(f => f.type === t)!

export const AQUA: FlowerType[] = ['lotus', 'snowlotus']
export const isAquatic = (t: FlowerType) => AQUA.includes(t)

// 3 chores/day. Seed→Sprout 2 wks, Sprout→Sapling 2 wks, then a month each.
export const STAGE_THRESHOLDS = [0, 42, 84, 174, 264]
export const STAGE_NAMES = ['Seed', 'Sprout', 'Sapling', 'Little tree', 'Blossom tree']
export const CHORES_PER_DAY = 3
export const TASKS_PER_LEVEL = 3
export const CHORES_PER_BLOSSOM = 90

export const BLOSSOM_SPOTS = (
  [[22, 205], [-96, 160], [-20, 124], [74, 150], [40, 110], [-70, 108], [-6, 228], [-56, 205], [92, 118],
    [-114, 126], [56, 190], [100, 170], [-90, 190], [16, 134], [-44, 136], [112, 140], [-30, 98]] as const
).map(([x, b], i) => ({ ml: x - 11, bottom: b, rot: (i * 37) % 90, c: i % 3 === 1 ? '#FFD0DC' : '#FFB3C7' }))

export interface ScenePlotSlot {
  lv: number
  left: string
  bottom: number
  water?: boolean
}
export const SCENE_PLOTS: ScenePlotSlot[] = [
  { lv: 2, left: '64%', bottom: 58 },
  { lv: 3, left: '35%', bottom: 58 },
  { lv: 4, left: '71%', bottom: 64 },
  { lv: 5, left: 'calc(6% + 196px)', bottom: 74, water: true },
  { lv: 7, left: 'calc(6% + 26px)', bottom: 76, water: true },
]
export const BED_LEVEL = 6
export const BED_MAX = 5

export function dayKey(off = 0) {
  const d = new Date()
  d.setDate(d.getDate() + off)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

/** Only the first 3 completions per day count as chores. */
export const choreSum = (log: Record<string, number>, simulateDays = 0) =>
  Object.values(log).reduce((a, v) => a + Math.min(CHORES_PER_DAY, v), 0) + simulateDays * CHORES_PER_DAY

export function stageIdx(chores: number) {
  let i = 0
  STAGE_THRESHOLDS.forEach((t, k) => { if (chores >= t) i = k })
  return i
}

export const blossomCount = (chores: number) =>
  chores < STAGE_THRESHOLDS[4] ? 0
    : Math.min(BLOSSOM_SPOTS.length, 5 + Math.floor((chores - STAGE_THRESHOLDS[4]) / CHORES_PER_BLOSSOM))

/** 0 sprout · 1 bud (≥1 task since planting) · 2 bloom (≥3). */
export function flowerStage(done: number, at: number) {
  const g = done - at
  return g <= 0 ? 0 : g < 3 ? 1 : 2
}

export const levelFor = (done: number) => 1 + Math.floor(done / TASKS_PER_LEVEL)

const SEED_TASKS: Task[] = [
  { id: 1, text: 'Water the real houseplants', status: 'todo' },
  { id: 2, text: 'Reply to Mika’s email', status: 'todo' },
  { id: 3, text: '15-minute stretch break', status: 'todo' },
  { id: 4, text: 'Plan the weekend picnic', status: 'todo' },
]

type Raw = Record<string, unknown>
const isObj = (v: unknown): v is Raw => !!v && typeof v === 'object' && !Array.isArray(v)
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isFlower = (v: unknown): v is FlowerType => FLOWERS.some(f => f.type === v)
const toPlanting = (v: unknown): Planting | null =>
  isObj(v) && isFlower(v.type) && isNum(v.at) ? { type: v.type, at: v.at } : null

/**
 * Coerce untrusted data (localStorage or an imported backup) into a valid garden,
 * dropping anything malformed. Returns `tasks: null` when there is no task list at all.
 */
export function normalizeGarden(s: Raw): Omit<SavedGarden, 'tasks'> & { tasks: Task[] | null } {
  const tasks = Array.isArray(s.tasks)
    ? s.tasks.flatMap((t): Task[] =>
      isObj(t) && isNum(t.id) && typeof t.text === 'string' && (t.status === 'todo' || t.status === 'done' || t.status === 'dropped')
        ? [{ id: t.id, text: t.text, status: t.status, doneAt: typeof t.doneAt === 'string' ? t.doneAt : null }]
        : [])
    : null

  let log: Record<string, number> = {}
  if (isObj(s.log)) {
    for (const [k, v] of Object.entries(s.log)) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && isNum(v) && v >= 0) log[k] = v
  } else if (isObj(s.today) && typeof s.today.date === 'string' && isNum(s.today.count)) {
    log = { [s.today.date]: s.today.count } // migrate the pre-log `today` shape
  }

  const plots: Record<number, Planting> = {}
  if (isObj(s.plots)) {
    for (const p of SCENE_PLOTS) {
      const pl = toPlanting(s.plots[p.lv])
      if (pl) plots[p.lv] = pl
    }
  }
  const oldBed = isObj(s.plots) ? toPlanting(s.plots[BED_LEVEL]) : null
  const bed = Array.isArray(s.bed)
    ? s.bed.map(toPlanting).filter((b): b is Planting => !!b).slice(0, BED_MAX)
    : oldBed ? [oldBed] : []

  const st = isObj(s.streak) ? s.streak : {}
  return {
    tasks,
    streak: { count: isNum(st.count) && st.count >= 0 ? st.count : 0, last: typeof st.last === 'string' ? st.last : null },
    log,
    plots,
    bed,
    weather: WEATHERS.includes(s.weather as Weather) ? (s.weather as Weather) : 'sunny',
    weatherLive: typeof s.weatherLive === 'boolean' ? s.weatherLive : true,
  }
}

export function loadGarden(): SavedGarden {
  let s: unknown = null
  try {
    s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch { /* corrupt or unavailable storage → fresh garden */ }
  const g = normalizeGarden(isObj(s) ? s : {})
  return { ...g, tasks: g.tasks ?? SEED_TASKS }
}

export function saveGarden(g: SavedGarden) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(g))
  } catch { /* storage full or blocked — the garden still works in memory */ }
}

/** Testing overrides via URL: ?tod=night&streak=8&days=120&hour=17.5 */
export interface TestingProps {
  timeOfDay: TimeOfDay | 'auto'
  streakOverride: number
  simulateDays: number
  /** Pretend the device clock reads this decimal hour (0–24). */
  hour: number | null
}
export function readTestingProps(): TestingProps {
  const q = new URLSearchParams(window.location.search)
  const tod = q.get('tod')
  return {
    timeOfDay: tod === 'morning' || tod === 'noon' || tod === 'sunset' || tod === 'night' ? tod : 'auto',
    streakOverride: Math.max(0, Number(q.get('streak')) || 0),
    simulateDays: Math.max(0, Number(q.get('days')) || 0),
    hour: q.has('hour') && Number.isFinite(Number(q.get('hour'))) ? ((Number(q.get('hour')) % 24) + 24) % 24 : null,
  }
}
