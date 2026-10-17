import { dayKey, normalizeGarden, type SavedGarden } from './garden'

const APP_ID = 'kawaii-garden'
const NOT_A_BACKUP = "That file doesn't look like a Kawaii Garden backup."

/** The backup file's contents. */
export const backupJson = (garden: SavedGarden) =>
  JSON.stringify({ app: APP_ID, version: 1, exportedAt: new Date().toISOString(), garden }, null, 2)

/** Download the garden as a dated JSON file. */
export function downloadBackup(garden: SavedGarden) {
  const url = URL.createObjectURL(new Blob([backupJson(garden)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `kawaii-garden-backup-${dayKey()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Parse a backup file's text. Throws an Error with a friendly message if it isn't one. */
export function parseBackup(text: string): { garden: SavedGarden; exportedAt: Date | null } {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error(NOT_A_BACKUP)
  }
  if (!raw || typeof raw !== 'object') throw new Error(NOT_A_BACKUP)
  const wrapper = raw as Record<string, unknown>
  // Accept our wrapped export, or a bare garden copied out of localStorage.
  const body = wrapper.app === APP_ID ? wrapper.garden : raw
  if (!body || typeof body !== 'object' || !Array.isArray((body as Record<string, unknown>).tasks)) throw new Error(NOT_A_BACKUP)

  const g = normalizeGarden(body as Record<string, unknown>)
  const when = typeof wrapper.exportedAt === 'string' ? new Date(wrapper.exportedAt) : null
  return { garden: { ...g, tasks: g.tasks ?? [] }, exportedAt: when && !isNaN(when.getTime()) ? when : null }
}
