import { useCallback, useEffect, useRef, useState } from 'react'
import { backupJson, downloadBackup } from './backup'
import { dayKey, type SavedGarden } from './garden'

/**
 * Automatic backups, by browser capability:
 * - 'file'  (Chrome/Edge): the user picks a file once; it's rewritten after every change
 *           and when the page is hidden or closed.
 * - 'daily' (Safari/Firefox): a dated backup is downloaded on the first click of each day.
 */
export type AutoMode = 'off' | 'file' | 'daily'
export type FileState = 'idle' | 'ready' | 'needs-permission' | 'missing' | 'error'

interface Settings {
  mode: AutoMode
  fileName: string | null
  lastDaily: string | null
  lastSavedAt: number | null
}

type RW = { mode: 'readwrite' }
type LinkedFile = FileSystemFileHandle & {
  queryPermission(d: RW): Promise<PermissionState>
  requestPermission(d: RW): Promise<PermissionState>
}
type SavePicker = (o: {
  suggestedName: string
  types: { description: string; accept: Record<string, string[]> }[]
}) => Promise<LinkedFile>

const pickerFn = (): SavePicker | undefined => (window as unknown as { showSaveFilePicker?: SavePicker }).showSaveFilePicker
export const canLinkFile = typeof window !== 'undefined' && !!pickerFn()

const SETTINGS_KEY = 'kawaii-garden-autobackup'
const WRITE_DELAY_MS = 1000

function loadSettings(): Settings {
  const off: Settings = { mode: 'off', fileName: null, lastDaily: null, lastSavedAt: null }
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null')
    if (!s || !['off', 'file', 'daily'].includes(s.mode)) return off
    // A file link made in Chrome can't be used in a browser without the API.
    if (s.mode === 'file' && !canLinkFile) return off
    return { ...off, ...s }
  } catch {
    return off
  }
}

// The file handle can't go in localStorage, but IndexedDB can store it.
function handleStore<T>(op: (s: IDBObjectStore) => IDBRequest): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('kawaii-garden', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('handles')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const tx = open.result.transaction('handles', 'readwrite')
      const req = op(tx.objectStore('handles'))
      req.onsuccess = () => resolve(req.result as T)
      req.onerror = () => reject(req.error)
    }
  })
}
const saveHandle = (h: LinkedFile) => handleStore(s => s.put(h, 'backup')).catch(() => undefined)
const loadHandle = () => handleStore<LinkedFile>(s => s.get('backup')).catch(() => undefined)
const forgetHandle = () => handleStore(s => s.delete('backup')).catch(() => undefined)

async function writeFile(h: LinkedFile, garden: SavedGarden) {
  const w = await h.createWritable()
  await w.write(backupJson(garden))
  await w.close()
}

export function useAutoBackup(garden: SavedGarden) {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [handle, setHandle] = useState<LinkedFile | null>(null)
  const [fileState, setFileState] = useState<FileState>('idle')
  const latest = useRef({ garden, settings, dirty: false })

  useEffect(() => {
    latest.current.garden = garden
    latest.current.settings = settings
  })
  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) } catch { /* ignore */ }
  }, [settings])

  const markSaved = useCallback(() => setSettings(s => ({ ...s, lastSavedAt: Date.now() })), [])

  // ---- 'file' mode ----
  // Reattach the linked file after a reload; the browser may want permission again.
  useEffect(() => {
    if (latest.current.settings.mode !== 'file') return
    loadHandle().then(async h => {
      if (!h) return setFileState('missing')
      setHandle(h)
      try {
        setFileState((await h.queryPermission({ mode: 'readwrite' })) === 'granted' ? 'ready' : 'needs-permission')
      } catch {
        setFileState('needs-permission')
      }
    })
  }, [])

  const flush = useCallback(async () => {
    if (!handle || fileState !== 'ready' || !latest.current.dirty) return
    latest.current.dirty = false
    try {
      await writeFile(handle, latest.current.garden)
      markSaved()
    } catch {
      setFileState('error')
    }
  }, [handle, fileState, markSaved])

  // Rewrite the file shortly after every change…
  useEffect(() => {
    if (settings.mode !== 'file') return
    latest.current.dirty = true
    const t = window.setTimeout(flush, WRITE_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [garden, settings.mode, flush])

  // …and right away when the tab is hidden or the browser is closing.
  useEffect(() => {
    if (settings.mode !== 'file') return
    const onHide = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
    }
  }, [settings.mode, flush])

  const linkFile = useCallback(async () => {
    const pick = pickerFn()
    if (!pick) return
    let h: LinkedFile
    try {
      h = await pick({
        suggestedName: 'kawaii-garden-backup.json',
        types: [{ description: 'Kawaii Garden backup', accept: { 'application/json': ['.json'] } }],
      })
    } catch {
      return // picker cancelled
    }
    try {
      await writeFile(h, latest.current.garden)
    } catch {
      setFileState('error')
      return
    }
    await saveHandle(h)
    setHandle(h)
    setFileState('ready')
    setSettings(s => ({ ...s, mode: 'file', fileName: h.name, lastSavedAt: Date.now() }))
  }, [])

  const reconnect = useCallback(async () => {
    if (!handle) return linkFile()
    try {
      if ((await handle.requestPermission({ mode: 'readwrite' })) !== 'granted') return
      await writeFile(handle, latest.current.garden)
      setFileState('ready')
      markSaved()
    } catch {
      setFileState('error')
    }
  }, [handle, linkFile, markSaved])

  // ---- 'daily' mode ----
  // Downloads need a user gesture, so back up on the first click/keypress of a new day.
  useEffect(() => {
    if (settings.mode !== 'daily') return
    const onGesture = () => {
      const today = dayKey()
      if (latest.current.settings.lastDaily === today) return
      latest.current.settings = { ...latest.current.settings, lastDaily: today }
      downloadBackup(latest.current.garden)
      setSettings(s => ({ ...s, lastDaily: today, lastSavedAt: Date.now() }))
    }
    document.addEventListener('pointerdown', onGesture, true)
    document.addEventListener('keydown', onGesture, true)
    return () => {
      document.removeEventListener('pointerdown', onGesture, true)
      document.removeEventListener('keydown', onGesture, true)
    }
  }, [settings.mode])

  const enableDaily = useCallback(() => {
    downloadBackup(latest.current.garden)
    setSettings(s => ({ ...s, mode: 'daily', lastDaily: dayKey(), lastSavedAt: Date.now() }))
  }, [])

  const turnOff = useCallback(() => {
    forgetHandle()
    setHandle(null)
    setFileState('idle')
    setSettings(s => ({ ...s, mode: 'off', fileName: null }))
  }, [])

  return {
    mode: settings.mode,
    fileName: settings.fileName,
    lastSavedAt: settings.lastSavedAt,
    fileState,
    canLinkFile,
    linkFile,
    reconnect,
    enableDaily,
    turnOff,
  }
}

export type AutoBackup = ReturnType<typeof useAutoBackup>
