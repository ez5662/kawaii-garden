import type { TimeOfDay } from './garden'

/** Sunrise / sunset as decimal local hours (e.g. 6.75 = 6:45). */
export interface SunTimes {
  rise: number
  set: number
}

/** Without a location, the sun arcs over 5:00–20:00 (the design's default day). */
export const DEFAULT_SUN: SunTimes = { rise: 5, set: 20 }

const BLEND_HOURS = 0.5 // sky cross-fades over ±30 min around each period change

const mod24 = (h: number) => ((h % 24) + 24) % 24
/** Signed distance from b to a on the 24h clock, in [-12, 12). */
const clockDiff = (a: number, b: number) => mod24(a - b + 12) - 12

export const hourOf = (d: Date) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600

/** Ignore polar day/night or bad data — fall back to the default day. */
export function usableSun(sun: SunTimes | null): SunTimes | null {
  if (!sun) return null
  const len = mod24(sun.set - sun.rise)
  return len >= 6 && len <= 20 ? sun : null
}

/** When each period starts. Follows the real sun if known, else the design's fixed hours. */
function periodStarts(sun: SunTimes | null): [TimeOfDay, number][] {
  if (!sun) return [['morning', 5], ['noon', 10], ['sunset', 16], ['night', 20]]
  return [
    ['morning', sun.rise - 0.5],
    ['noon', sun.rise + 3.5],
    ['sunset', sun.set - 1.5],
    ['night', sun.set + 0.66],
  ]
}

export function periodAt(h: number, sun: SunTimes | null): TimeOfDay {
  let best: TimeOfDay = 'night', bestD = 25
  for (const [p, start] of periodStarts(sun)) {
    const d = mod24(h - start)
    if (d < bestD) { best = p; bestD = d }
  }
  return best
}

/** Sky cross-fade: draw `from` fully, then `to` on top at opacity `t`. */
export interface SkyBlend {
  from: TimeOfDay
  to: TimeOfDay
  t: number
}

export function skyBlend(h: number, sun: SunTimes | null): SkyBlend {
  const starts = periodStarts(sun)
  for (let i = 0; i < starts.length; i++) {
    const [to, start] = starts[i]
    const d = clockDiff(h, start)
    if (Math.abs(d) < BLEND_HOURS) {
      const from = starts[(i + starts.length - 1) % starts.length][0]
      return { from, to, t: (d + BLEND_HOURS) / (2 * BLEND_HOURS) }
    }
  }
  const p = periodAt(h, sun)
  return { from: p, to: p, t: 0 }
}

export const blendWeight = (b: SkyBlend, p: TimeOfDay) =>
  (b.from === p ? 1 - b.t : 0) + (b.to === p ? b.t : 0)

/** 0 at `from`, 1 at `to`; ≥ 1 means the body is below the horizon. */
export function arcProgress(h: number, from: number, to: number) {
  return mod24(h - from) / mod24(to - from)
}

/** A representative hour for a forced time of day (testing override). */
export function hourForPeriod(p: TimeOfDay, sun: SunTimes): number {
  switch (p) {
    case 'morning': return mod24(sun.rise + 1.5)
    case 'noon': return mod24(sun.rise + mod24(sun.set - sun.rise) / 2)
    case 'sunset': return mod24(sun.set - 0.6)
    case 'night': return mod24(sun.set + mod24(sun.rise - sun.set) / 2)
  }
}

/**
 * Position on the sky arc. Left runs 10% → 90%; at the ends the body sits on the
 * ground line (scene height − 150px), so it rises from and sinks behind the hills.
 */
export function arcPosition(p: number, topPad: number) {
  const k = 1 - Math.sin(Math.PI * Math.min(1, Math.max(0, p)))
  return {
    left: (10 + Math.min(1, p) * 80).toFixed(2) + '%',
    top: `calc(${topPad}px + (100% - ${150 + topPad}px) * ${k.toFixed(4)})`,
  }
}
